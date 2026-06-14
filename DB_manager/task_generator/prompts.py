from langchain_core.prompts import ChatPromptTemplate

PLANNER_PROMPT = ChatPromptTemplate.from_template("""
Jesteś głównym metodykiem i twórcą koncepcji dydaktycznych. Twoim zadaniem jest zaplanowanie SZKICÓW (konceptów) do {count} zadań matematycznych wielokrotnego wyboru na poziomie: {difficulty}.
Tworzysz materiały WYŁĄCZNIE na poziomie podstawowym dla szkoły średniej w Polsce (matura podstawowa).
Ty nie rozwiązujesz zadań, ani nie tworzysz dokładnych odpowiedzi (tym zajmie się Generator w kolejnym kroku). Twoim celem jest wymyślenie zróżnicowanych, merytorycznie spójnych i ciekawych pomysłów ("szkieletów" zadań), które rygorystycznie przestrzegają obostrzeń wiedzy ucznia.

KONTEKST ZADANIA (GŁÓWNY CEL):
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Inne (sąsiednie) grupy zadań w tym podtemacie: {sibling_task_groups}

WIEDZA UPRZEDNIA UCZNIA (MOŻESZ Z NIEJ KORZYSTAĆ):
Poprzednie tematy ucznia: {known_topics_names}
Poprzednie podtematy z tego działu: {known_subtopics_theories}

ZAKAZANY MATERIAŁ (ABSOLUTNY ZAKAZ UŻYWANIA):
Nieznane tematy: {unknown_topics_names}

ZASADY:
1. Poziom trudności ({difficulty}):
   - Easy: Banale podstawienie do wzoru, sprawdzenie definicji.
   - Medium: Typowe zadanie 2-krokowe (np. wyznacz a, potem oblicz b).
   - Hard: Wymaga sprytu, połączenia 2-3 znanych koncepcji lub zagnieżdżenia działań.
   - Very Hard: Przypadki szczególne, zawiłe przekształcenia algebraiczne w ramach podstawy, zadania z ukrytym haczykiem.
2. Ograniczenie wiedzy (STRICT): W swoich szkicach absolutnie nie planuj używania pojęć, operacji, ani funkcji z "Zakazanego materiału". Oprzyj się TYLKO na bieżącym temacie i wiedzy uprzedniej.
3. Separacja: Upewnij się, że szkic celuje dokładnie w grupę "{group}" i nie wchodzi w kompetencje sąsiednich grup.
4. Różnorodność: Każdy z {count} szkiców musi mieć INNY pomysł na ułożenie treści (inne podejście, inny typ danych wejściowych, np. raz podana figura, raz treść opisowa, raz parametry).
5. Inspiracja wizjonerska: {inspiration}
   (Spróbuj przemycić ten klimat/ideę w szkicach, o ile ma to sens i nie psuje matematyki).
6. Random Seed: {random_seed} (dla unikalności).

Zwróć TYLKO czysty JSON jako listę dokładnie {count} obiektów:
[
  {{
    "task_concept": "Szczegółowy opis o co pytamy (np. Oblicz pole trójkąta znając boki 3,4,5). Wskaż jakie liczby/wzory mają być użyte.",
    "trap_or_trick": "Opisz czy jest tu jakiś haczyk lub na co uczeń ma uważać (np. uwaga na jednostki, uwaga na wartość bezwzględną z definicji pierwiastka).",
    "math_tools_required": "Z jakiej wiedzy (związanej z bieżącym tematem) uczeń musi skorzystać"
  }}
]
""")

GENERATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś precyzyjnym konstruktorem zadań matematycznych (Realizatorem). Tworzysz wybitne zadania wielokrotnego wyboru na poziomie podstawowym dla polskiej szkoły średniej.
Twoim celem jest przekucie otrzymanej listy SZKICÓW (Planów) na konkretne treści zadań, dokładne liczby i poprawnie skonstruowane warianty odpowiedzi (A, B, C, D).

POZIOM TRUDNOŚCI ZADAŃ: {difficulty}

LISTA SZKICÓW ZADAŃ DO ZREALIZOWANIA (ZAPLANOWANE PRZEZ METODYKA W FORMACIE JSON):
{blueprints_json}

KONTEKST EDUKACYJNY (DO ZACHOWANIA ZGODNOŚCI):
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Wiedza uprzednia ucznia: {known_topics_names} | {known_subtopics_theories}
ZAKAZANY MATERIAŁ (Absolutny zakaz pojęć z tych działów): {unknown_topics_names}

TWOJE WYTYCZNE DLA KAŻDEGO SZKICU:
1. Realizacja: Wypełnij szkic konkretnymi, sensownymi liczbami. Przeprowadź w głowie obliczenia, aby mieć pewność, że wynik końcowy wychodzi "ładny" (lub zgodnie z planem w szkicu).
2. Jakość merytoryczna: Treść zadania musi być jasna, jednoznaczna i nie budzić wątpliwości egzaminacyjnych.
3. Opcje: Wygeneruj dokładnie 4 opcje (0, 1, 2, 3). TYLKO JEDNA opcja musi być w 100% poprawna. Pozostałe 3 niepoprawne odpowiedzi muszą być dystraktorami (wynikać z typowych błędów, pomyłek w znakach, niezrozumienia 'haczyka' ze szkicu itp.).
4. Ograniczenie wiedzy: Nawet realizując szkic, BEZWZGLĘDNIE trzymaj się zasady, by nie używać pojęć i symboli nieznanych uczniowi (Zakazany materiał).
5. Formatowanie: Używaj czystego tekstu z prostym ujęciem LaTeX dla matematyki (bez ucieczkowania JSON - tym zajmie się formater w innym kroku).

Zwróć TYLKO czysty JSON jako LISTĘ obiektów (w takiej samej kolejności i liczbie jak przekazane szkice):
[
  {{
    "question": "Treść zadania (surowy tekst z prostym texem, bez ukośników)",
    "options": ["Opcja 0", "Opcja 1", "Opcja 2", "Opcja 3"],
    "correct_index": 0
  }}
]
""")

SOLVER_PROMPT = ChatPromptTemplate.from_template("""
Jesteś rygorystycznym matematykiem i egzaminatorem. Otrzymujesz surową paczkę zadań od innego nauczyciela.

KONTEKST EDUKACYJNY UCZNIA:
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Wiedza uprzednia ucznia (Z tego możesz korzystać): {known_topics_names} | {known_subtopics_theories}
Nieznane tematy (ABSOLUTNY ZAKAZ UŻYWANIA): {unknown_topics_names}

SUROWA PACZKA ZADAŃ (JSON):
{tasks_batch_json}

ZADANIE DLA KAŻDEGO ELEMENTU Z PACZKI:
1. Rozwiąż zadanie od zera krok po kroku, nie patrząc na "correct_index" sugerowany przez AI.
2. Pisz BARDZO PROSTYM i zrozumiałym językiem. Tłumacz rozwiązanie tak, jakbyś mówił do ucznia szkoły średniej. Unikaj sztywnego, akademickiego żargonu.
3. OGRANICZENIA WIEDZY (KRYTYCZNE): Uczeń zna TYLKO zagadnienia z bieżącej teorii i wiedzy uprzedniej. Absolutnie nie wolno Ci w rozwiązaniu używać pojęć, twierdzeń, ani notacji z tematów nieznanych (np. nie używaj wartości bezwzględnej / modułu przy obliczaniu odległości, jeśli uczeń nie poznał wprost tego pojęcia). Rozwiązanie musi być oparte na najprostszych, aktualnie dostępnych dla ucznia metodach krok po kroku!
4. Sprawdź, czy dokładnie JEDNA opcja jest poprawna.

Zwróć TYLKO czysty JSON jako listę wyników w tej samej kolejności. Nie przejmuj się formatowaniem LaTeX, używaj surowego tekstu z prostym ujęciem wzorów, bo kto inny to ładnie sformatuje. Najważniejsze to poprawność!
[
  {{
    "task_index": 0,
    "raw_solution": "Twoje szczegółowe surowe notatki i rozwiązanie na brudnopisie...",
    "is_valid": true, 
    "solved_index": 2, 
    "error_reason": null
  }}
]
""")

FORMATTER_PROMPT = ChatPromptTemplate.from_template("""
Jesteś głównym projektantem wizualnym (Typesetter) platformy edukacyjnej. Znasz perfekcyjnie zasady LaTeX oraz rygorystyczne zasady struktury JSON.
Otrzymujesz surowe treści zadań matematycznych połączone z notatkami ich rozwiązania.
Twoim JEDYNYM celem jest przepisanie ich do w pełni sformatowanego, estetycznego obiektu JSON zgodnego ze schematem bazy danych.

SUROWE DANE WEJŚCIOWE (ZADANIA + ROZWIĄZANIA):
{merged_batch_json}

KRYTYCZNE ZASADY FORMATOWANIA (JSON I LATEX):
1. ZNACZNIKI MATEMATYKI: Każda liczba, zmienna i wzór MUSZĄ być w LaTeX ($...$ w tekście, $$...$$ w nowej linii dla dużych równań). Dotyczy to treści, wariantów odpowiedzi i rozwiązań.
2. JSON ESCAPING (BEZWZGLĘDNIE WAŻNE): Zwracasz odpowiedź jako czysty tekst JSON. Każda komenda LaTeX (ukośnik) musi zostać ucieczkowana dwukrotnie! Np. napisz "\\\\frac" zamiast \\frac, "\\\\alpha" zamiast \\alpha, "\\\\in" zamiast \\in.
3. Zadbaj o estetykę i poprawne łamanie linii (BARDZO WAŻNE):
   - ABSOLUTNY ZAKAZ wprowadzania wielu definicji (np. dwóch równań lub zbiorów) ciągiem w jednej linii tekstu. Dłuższe wyrażenia pisane językiem matematyki bezwzględnie przenoś do nowej linii, aby uniknąć brzydkiego ucinania!
   - Wymień je pod sobą w JEDNYM wieloliniowym bloku matematycznym $$...$$.
   - Wnętrze bloku matematycznego $$...$$ przełamuj podwójnym ukośnikiem LaTeX. Jeśli obok siebie masz "niskie" linijki (zwykłe zmienne, teksty), użyj zwykłego nowej linii, co w JSON zapisujesz jako CZTERY ukośniki: "\\\\\\\\".
   - JEDNAKŻE, jeśli w bloku $$...$$ łamiesz linię, a w PIONIE występują "wysokie", piętrowe struktury (ułamki \\\\frac, granice \\\\lim, sumy \\\\sum, całki, macierze, czy potęgi piętrowe), BEZWZGLĘDNIE dodaj odstęp pionowy (np. 15pt). W JSON zapisz to DOKŁADNIE TAK: "\\\\\\\\[15pt]". 
   - ABSOLUTNY ZAKAZ zapisu typu "\\\\\\\[15pt]" (trzy ukośniki widoczne po sparsowaniu to błąd syntaxu). Wymagane są dokładnie CZTERY ukośniki i od razu nawias kwadratowy: "\\\\\\\\[15pt]".
   - W zwykłym tekście (poza $$) zabrania się używania "\\\\\\\\" do nowej linii - tam używaj standardowego "\\n".
   - BARDZO WAŻNE: Pojedyncze liczby, pojedyncze ułamki i wyrażenia będące CZEŚCIĄ ZDANIA (wplecione w tekst) ZAWSZE umieszczaj w pojedynczych dolarach $...$ (inline math), np. "Liczba $x$ to $5$". 
   - KARYGODNY BŁĄD (ABSOLUTNY ZAKAZ): Nigdy nie obejmuj całych zdań lub słów znacznikami matematycznymi (dolarami)! Zapis typu "$Liczba \\\\ z \\\\ jest \\\\ równa \\\\ 1.$" jest surowo zabroniony, ponieważ wymusza pochyły styl matematyczny na zwykłym tekście polskim. Zwykły tekst ma być CAŁKOWICIE POZA dolarami! Wzorowy zapis to: "Liczba $z$ jest równa $1$."
   - ABSOLUTNY ZAKAZ używania podwójnych dolarów $$...$$ wewnątrz zdań. Podwójne dolary służą TYLKO i WYŁĄCZNIE do wydzielonych, wieloliniowych, wyśrodkowanych bloków równań pod tekstem.
   - ZŁY ZAPIS (w zdaniu): "Wynik to $$ \\\\frac{{1}}{{2}} $$." (to rozbije zdanie na 3 linie!)
   - WZORCOWY ZAPIS (w zdaniu): "Wynik to $ \\\\frac{{1}}{{2}} $."
   - WZORCOWY ZAPIS (blokowy, z wysokimi równaniami): "Zatem wynik to:\n$$ \\\\frac{{1}}{{2}} \\\\\\\\[15pt] \\\\frac{{3}}{{4}} $$"
4. OZNACZENIA ODPOWIEDZI (KRYTYCZNE): W tekście rozwiązania (w "exemplary_solution") ABSOLUTNIE NIE PISZ o "indeksach" odpowiedzi (np. "odpowiada indeksowi 1", "opcja o indeksie 2"). Jeśli podsumowujesz wynik i chcesz wskazać prawidłową opcję, używaj ZAWSZE liter A, B, C, D (gdzie indeks 0 to A, 1 to B, 2 to C, 3 to D). Np. pisz "Poprawna odpowiedź to B", a nie "Poprawna odpowiedź to indeks 1".

Zwróć TYLKO czystą listę JSON z przepisanymi zadaniami:
[
  {{
    "difficulty_level": "{difficulty}",
    "content": {{
      "question": "Sformatowana w piękny $LaTeX$ treść...",
      "options": ["$Opcja 0$", "$Opcja 1$", "$Opcja 2$", "$Opcja 3$"],
      "correct_index": 2
    }},
    "exemplary_solution": "Pięknie sformatowane w $LaTeX$ rozwiązanie krok po kroku na podstawie notatek z raw_solution..."
  }}
]
""")

FINAL_VALIDATOR_PROMPT = ChatPromptTemplate.from_template("""
Jesteś głównym audytorem systemowym (Ostatnia Instancja). Cel: sprawdzić czy struktura jest idealna do bazy danych.

ZADANIE DO OCENY:
{final_task_json}

KRYTERIA:
1. MATEMATYKA: Czy wskazany "correct_index" na pewno pasuje do rozwiązania "exemplary_solution" i pytania "question"? Zrób rygorystyczny przegląd rachunków.
2. ROZWIĄZANIE: Czy zadanie posiada "exemplary_solution" i nie jest to wartość pusta? (Brak rozwiązania oznacza natychmiastowy brak walidacji).
3. FORMAT: Czy WSZYSTKIE liczby i zmienne są w znacznikach $...$ lub $$...$$? Czy bloki równań i układów są poprawne?

Zwróć TYLKO czysty JSON. BARDZO WAŻNE: Pamiętaj o ucieczkowaniu ukośników w polu "reasoning" zgodnie ze standardem JSON (np. komendy zapisuj jako "\\\\alpha", "\\\\frac", a nową linię w LaTeX jako "\\\\\\\\"), aby nie zepsuć struktury pliku:
{{
  "reasoning": "Przeprowadź końcowy audyt formatu i matematyki...",
  "is_perfect": true,
  "feedback": "Jeśli is_perfect to false, opisz krótko błąd. Jeśli true, wpisz null."
}}
""")