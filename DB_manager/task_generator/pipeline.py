import json
import time
from langchain_core.output_parsers import JsonOutputParser
from prompts import PLANNER_PROMPT, GENERATOR_PROMPT, SOLVER_PROMPT, FORMATTER_PROMPT, FINAL_VALIDATOR_PROMPT
from inspirations import get_generation_params

def invoke_with_retry(chain, params, max_retries=5, delay=10):
    for attempt in range(max_retries):
        try:
            return chain.invoke(params)
        except Exception as e:
            print(f"Błąd API. Czekam {delay}s (Próba {attempt+1}/{max_retries}): {e}")
            time.sleep(delay)
    return None

def run_generation_pipeline(llm, context, counts):
    parser = JsonOutputParser()

    BATCH_SIZES = {
        "Easy": 8,
        "Medium": 5,
        "Hard": 3,
        "Very Hard": 1
    }

    for diff, total_count in counts.items():
        total_count = int(total_count)
        if total_count <= 0: continue
        
        batch_size = BATCH_SIZES.get(diff, 5)
        batches = [batch_size] * (total_count // batch_size) + ([total_count % batch_size] if total_count % batch_size != 0 else [])
        
        for batch_count in batches:
            gen_params = get_generation_params()
            
            # FAZA 0: PLANER (Wymyślanie szkiców zadań dla całego batcha)
            planner_input = {
                "count": batch_count, 
                "difficulty": diff, 
                **gen_params, 
                **context
            }
            plan_chain = PLANNER_PROMPT | llm | parser
            blueprints = invoke_with_retry(plan_chain, planner_input)
            
            if not blueprints: continue
            if isinstance(blueprints, dict): blueprints = [blueprints]

            # FAZA I: KREATYWNY GENERATOR (Tworzenie surowych zadań na bazie całej listy szkiców)
            generator_input = {
                "blueprints_json": json.dumps(blueprints, ensure_ascii=False), 
                "difficulty": diff, 
                **context
            }
            gen_chain = GENERATOR_PROMPT | llm | parser
            raw_batch = invoke_with_retry(gen_chain, generator_input)
            
            if not raw_batch: continue
            if isinstance(raw_batch, dict): raw_batch = [raw_batch]

            # FAZA II: SUROWY SOLVER (Liczenie zadań)
            solver_input = {
                "tasks_batch_json": json.dumps(raw_batch, ensure_ascii=False),
                **context
            }
            solv_chain = SOLVER_PROMPT | llm | parser
            solver_results = invoke_with_retry(solv_chain, solver_input)
            if not solver_results: continue
            if isinstance(solver_results, dict): solver_results = [solver_results]

            # ŁĄCZENIE ZADAŃ POPRAWNYCH LOGICZNIE
            merged_for_formatter = []
            debug_info_list = []
            for i, task in enumerate(raw_batch):
                s_res = next((r for r in solver_results if r.get("task_index") == i), None)
                if s_res and s_res.get("is_valid"):
                    merged_for_formatter.append({
                        "raw_task": task,
                        "raw_solution": s_res.get("raw_solution", ""),
                        "solved_index": s_res.get("solved_index", 0)
                    })
                    debug_info_list.append({
                        "planner_input": planner_input,
                        "planner_output": blueprints,
                        "generator_input": generator_input,
                        "generator_output": raw_batch,
                        "solver_input": solver_input,
                        "solver_output": solver_results,
                    })

            if not merged_for_formatter: continue

            # FAZA III: PERFEKCYJNY FORMATER (LaTeX i JSON escaping dla całego działającego batcha)
            formatter_input = {
                "merged_batch_json": json.dumps(merged_for_formatter, ensure_ascii=False),
                "difficulty": diff
            }
            form_chain = FORMATTER_PROMPT | llm | parser
            formatted_batch = invoke_with_retry(form_chain, formatter_input)
            if not formatted_batch: continue
            if isinstance(formatted_batch, dict): formatted_batch = [formatted_batch]
            
            import copy
            original_formatted_batch = copy.deepcopy(formatted_batch)

            # FAZA IV: BEZWZGLĘDNY WALIDATOR (Sprawdzanie każdego sformatowanego zadania z osobna)
            for i, formatted_task in enumerate(formatted_batch):
                # Twarde wymuszenie żądanego poziomu trudności (zapobiega halucynacjom modelu)
                formatted_task["difficulty_level"] = diff
                
                # Przekazanie użytej inspiracji do panelu (tylko do podglądu UI)
                formatted_task["inspiration"] = gen_params.get("inspiration")

                # Dołączenie informacji debugowych do podglądu w UI
                if i < len(debug_info_list):
                    formatted_task["debug_info"] = debug_info_list[i]
                    formatted_task["debug_info"]["formatter_input"] = formatter_input
                    formatted_task["debug_info"]["formatter_output"] = original_formatted_batch

                # Ukrywamy debug_info przed walidatorem, żeby go nie rozpraszać surowymi notatkami i złym LaTeXem
                task_for_validation = formatted_task.copy()
                task_for_validation.pop("debug_info", None)

                validator_input = {
                    "final_task_json": json.dumps(task_for_validation, ensure_ascii=False)
                }
                val_chain = FINAL_VALIDATOR_PROMPT | llm | parser
                val_res = invoke_with_retry(val_chain, validator_input)
                
                if val_res:
                    formatted_task["validation"] = {"is_perfect": val_res.get("is_perfect", False), "feedback": val_res.get("feedback")}
                    if "debug_info" in formatted_task:
                        formatted_task["debug_info"]["validator_reasoning"] = val_res.get("reasoning", "")
                        formatted_task["debug_info"]["validator_input"] = validator_input
                        formatted_task["debug_info"]["validator_output"] = val_res
                else:
                    # Błąd spowodowany wyczerpanymi limitami (Rate limit) lub zepsutym parsowaniem JSON przez LLM
                    formatted_task["validation"] = {"is_perfect": False, "feedback": "Błąd API (Nie powiodła się finalna weryfikacja - sprawdź logi w terminalu)"}
                    if "debug_info" in formatted_task:
                        formatted_task["debug_info"]["validator_input"] = validator_input
                        formatted_task["debug_info"]["validator_output"] = {"error": "Błąd API"}
                
                # Wyrzucamy gotowe zadanie od razu (Streaming JSONL)
                yield json.dumps(formatted_task, ensure_ascii=False) + "\n"