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
7. Użycie tabeli (STRICT): Tabelę planuj TYLKO wtedy, gdy nazwa bieżącej grupy zadań ("{group}") wprost i jednoznacznie tego wymaga (np. zawiera słowa "z tabeli", "tabela liczebności", "tabeli częstości") LUB gdy wprost nakazuje to wylosowana inspiracja. Jeśli grupa zadań tego wprost nie wymaga, twórz zadania w standardowej formie (treść tekstowa, formuły algebraiczne, pojedyncze dane liczbowe) – nie wciskaj tabeli na siłę tam, gdzie nie jest niezbędna.

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
6. Tabele: Strukturę tabeli w treści zadania ("question") stosuj TYLKO wtedy, gdy szkic lub grupa ("{group}") wyraźnie jej wymaga. W pozostałych przypadkach formułuj zadania standardowo, bez tabeli.
7. Sens fizyczny wielkości policzalnych: Wszystkie rzeczy fizyczne i policzalne (np. liczba rzutów kostką, monetą, liczba osób, uczniów, kul, losów itp.) bezwzględnie muszą być liczbami całkowitymi – NIGDY nie mogą być ułamkami!

Zwróć TYLKO czysty JSON jako LISTĘ obiektów (w takiej samej kolejności i liczbie jak przekazane szkice):
[
  {{
    "question": "Treść zadania (surowy tekst z prostym texem, bez ucieczkowania JSON)",
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
4. Zadania z danymi w tabeli: Jeśli zadanie zawiera tabelę, w rozwiązaniu wyraźnie wskaż odczytanie danych z tabeli i zapisz pełne działanie prowadzące do wyniku.
5. Sprawdź, czy dokładnie JEDNA opcja jest poprawna.

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
5. TABELE I STRUKTURY DANYCH (STOSUJ WYŁĄCZNIE GDY W TREŚCI ZADANIA WYSTĘPUJE TABELA):
   - Jeśli otrzymana treść zadania zawiera tabelę lub zestawienie danych tabelarycznych:
     Sformatuj te dane jako estetyczną, wyśrodkowaną tabelę LaTeX w osobnym bloku $$...$$ przy użyciu środowiska \\\\begin{{array}} ... \\\\end{{array}}.
   - W zadaniach, które NIE zawierają tabeli, absolutnie NIE twórz tabeli na siłę – pozostaw ich naturalną strukturę zwykłego tekstu i równań!
   - Zadbaj o pełne obramowanie tabeli: podaj pionowe kreski między kolumnami (np. {{|c|c|c|c|}}) oraz linie poziome (\\\\hline) przed pierwszym wierszem, po każdym wierszu i na końcu tabeli.
   - KRYTYCZNA ZASADA DLA WYRAZÓW W TABELI: Ponieważ środowisko array działa w trybie matematycznym, KAŻDY polski wyraz lub nagłówek (np. Wartość, Liczebność, Ocena, Liczba uczniów, Wynik) MUSI być zapisany wewnątrz komendy \\\\text{{...}} (np. \\\\text{{Ocena}} lub \\\\text{{Liczba uczniów}}). Bez tego tekst zleje się w brzydkie pochyłe litery matematyczne!
   - Nowy wiersz w tabeli LaTeX to symbol podwójnego ukośnika, co w formacie JSON wymaga zapisania CZTERECH ukośników: "\\\\\\\\".
   - WAŻNE: Otwierające $$ i zamykające $$ umieszczaj w tej samej linijce co \\\\begin{{array}} i \\\\end{{array}} (np. "$$ \\\\begin{{array}}...\\\\end{{array}} $$"), bez pustych enterów zaraz po '$$' ani przed '$$'.
   - WZORCOWY ZAPIS TABELI POZIOMEJ W TREŚCI ZADANIA (question):
     "W tabeli przedstawiono wyniki sprawdzianu z matematyki w pewnej klasie:\n$$ \\\\begin{{array}}{{|c|c|c|c|c|}}\\\\hline \\\\text{{Ocena}} & 2 & 3 & 4 & 5 \\\\\\\\ \\\\hline \\\\text{{Liczba uczniów}} & 3 & 7 & 6 & 4 \\\\\\\\ \\\\hline \\\\end{{array}} $$\nŚrednia arytmetyczna ocen z tego sprawdzianu jest równa:"
   - WZORCOWY ZAPIS TABELI PIONOWEJ (gdy danych jest więcej):
     "W tabeli przedstawiono zestawienie danych statystycznych:\n$$ \\\\begin{{array}}{{|c|c|}}\\\\hline \\\\text{{Wartość cechy}} & \\\\text{{Liczebność}} \\\\\\\\ \\\\hline 10 & 2 \\\\\\\\ \\\\hline 20 & 5 \\\\\\\\ \\\\hline 30 & 3 \\\\\\\\ \\\\hline \\\\end{{array}} $$\nOblicz średnią arytmetyczną podanych danych."
   - UKŁADY RÓWNAŃ I FUNKCJE KLAMROWE: Gdy w zadaniu występuje układ równań lub funkcja klamrowa, również używaj czystego bloku $$...$$ ze środowiskiem \\\\begin{{cases}} ... \\\\end{{cases}}.
   - ROZWIĄZANIE DLA ZADAŃ Z TABELI: W exemplary_solution elegancko rozpisuj obliczenia za pomocą ułamka blokowego, np.:
     "Obliczamy średnią arytmetyczną z danych w tabeli:\n$$ \\\\bar{{x}} = \\\\frac{{2 \\\\cdot 3 + 3 \\\\cdot 7 + 4 \\\\cdot 6 + 5 \\\\cdot 4}}{{3 + 7 + 6 + 4}} = \\\\frac{{6 + 21 + 24 + 20}}{{20}} = \\\\frac{{71}}{{20}} = 3,55 $$"

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
3. FORMAT: Czy WSZYSTKIE liczby i zmienne są w znacznikach $...$ lub $$...$$? Czy bloki równań i układów są poprawne? Jeśli zadanie należy do grupy wprost wymagającej tabeli (np. tabela liczebności) lub zawiera tabelę, czy tabela w LaTeX jest poprawna składniowo i posiada nagłówki w \\\\text{{...}}? (W pozostałych zadaniach obecność tabeli nie jest wymagana).
4. SENS FIZYCZNY I POLICZALNOŚĆ (OBIEKTY DYSKRETNE VS WIELKOŚCI CIĄGŁE):
   a) Liczności obiektów dyskretnych/niepodzielnych oraz liczba powtórzeń (np. liczba osób, uczniów, zwierząt/stworzeń, rzutów kostką/monetą, kul, kart, losów, wierzchołków, sztuk towaru) BEZWZGLĘDNIE MUSZĄ być liczbami całkowitymi (nie może być 2,5 osoby ani 3,5 rzutu).
   b) Ciągłe wielkości fizyczne i pomiarowe (np. masa w kg/g, długość w cm/m, czas, temperatura, kwoty pieniężne w zł, pole, objętość) JAK NAJBARDZIEJ MOGĄ być ułamkami lub liczbami dziesiętnymi (np. 10,25 kg, 2,5 m czy 12,50 zł to w 100% poprawne dane). NIGDY nie odrzucaj zadania z powodu ułamkowych mas, długości czy cen.

Zwróć TYLKO czysty JSON. BARDZO WAŻNE: Pamiętaj o ucieczkowaniu ukośników w polu "reasoning" zgodnie ze standardem JSON (np. komendy zapisuj jako "\\\\alpha", "\\\\frac", a nową linię w LaTeX jako "\\\\\\\\"), aby nie zepsuć struktury pliku:
{{
  "reasoning": "Przeprowadź końcowy audyt formatu i matematyki...",
  "is_perfect": true,
  "feedback": "Jeśli is_perfect to false, opisz krótko błąd. Jeśli true, wpisz null."
}}
""")


# ============================================================
# PROMPTY DLA ZADAŃ OTWARTYCH (OPEN)
# Uczeń wpisuje odpowiedź liczbową (string, bo może być ułamek)
# ============================================================

PLANNER_PROMPT_OPEN = ChatPromptTemplate.from_template("""
Jesteś głównym metodykiem i twórcą koncepcji dydaktycznych. Twoim zadaniem jest zaplanowanie SZKICÓW (konceptów) do {count} zadań matematycznych z ODPOWIEDZIĄ OTWARTĄ (uczeń wpisuje wynik liczbowy) na poziomie: {difficulty}.
Tworzysz materiały WYŁĄCZNIE na poziomie podstawowym dla szkoły średniej w Polsce (matura podstawowa).
Ty nie rozwiązujesz zadań, ani nie tworzysz dokładnych odpowiedzi (tym zajmie się Generator w kolejnym kroku). Twoim celem jest wymyślenie zróżnicowanych, merytorycznie spójnych i ciekawych pomysłów ("szkieletów" zadań), które rygorystycznie przestrzegają obostrzeń wiedzy ucznia.

WAŻNE: To są zadania OTWARTE — uczeń NIE wybiera z listy opcji, lecz sam wpisuje wynik liczbowy. Wynik musi być jednoznaczny (jedna konkretna liczba, ułamek lub wyrażenie). Unikaj zadań, w których poprawnych odpowiedzi jest wiele lub odpowiedź jest zbiorem/przedziałem.

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
   - Easy: Banale podstawienie do wzoru, sprawdzenie definicji. Wynik to prosta liczba całkowita.
   - Medium: Typowe zadanie 2-krokowe. Wynik może być ułamkiem lub liczbą dziesiętną.
   - Hard: Wymaga sprytu, połączenia 2-3 znanych koncepcji. Wynik wymaga kilku przekształceń.
   - Very Hard: Przypadki szczególne, zawiłe przekształcenia. Wynik wymaga wieloetapowego rozwiązania.
2. Ograniczenie wiedzy (STRICT): W swoich szkicach absolutnie nie planuj używania pojęć, operacji, ani funkcji z "Zakazanego materiału". Oprzyj się TYLKO na bieżącym temacie i wiedzy uprzedniej.
3. Separacja: Upewnij się, że szkic celuje dokładnie w grupę "{group}" i nie wchodzi w kompetencje sąsiednich grup.
4. Różnorodność: Każdy z {count} szkiców musi mieć INNY pomysł na ułożenie treści.
5. Jednoznaczność wyniku: Zaplanuj zadania tak, żeby wynik był JEDNĄ konkretną wartością liczbową (np. 7, 3/4, 0.25, -2). NIE planuj zadań z wieloma poprawnymi odpowiedziami.
6. Inspiracja wizjonerska: {inspiration}
   (Spróbuj przemycić ten klimat/ideę w szkicach, o ile ma to sens i nie psuje matematyki).
7. Random Seed: {random_seed} (dla unikalności).
8. Użycie tabeli (STRICT): Tabelę planuj TYLKO wtedy, gdy nazwa bieżącej grupy zadań ("{group}") wprost i jednoznacznie tego wymaga LUB gdy wprost nakazuje to wylosowana inspiracja.

Zwróć TYLKO czysty JSON jako listę dokładnie {count} obiektów:
[
  {{
    "task_concept": "Szczegółowy opis o co pytamy (np. Oblicz wartość wyrażenia 2^3 + 5). Wskaż jakie liczby/wzory mają być użyte.",
    "expected_answer_type": "Jakiego typu będzie odpowiedź (np. liczba całkowita, ułamek zwykły, liczba dziesiętna)",
    "trap_or_trick": "Opisz czy jest tu jakiś haczyk lub na co uczeń ma uważać.",
    "math_tools_required": "Z jakiej wiedzy (związanej z bieżącym tematem) uczeń musi skorzystać"
  }}
]
""")

GENERATOR_PROMPT_OPEN = ChatPromptTemplate.from_template("""
Jesteś precyzyjnym konstruktorem zadań matematycznych (Realizatorem). Tworzysz wybitne zadania z ODPOWIEDZIĄ OTWARTĄ (uczeń wpisuje wynik liczbowy) na poziomie podstawowym dla polskiej szkoły średniej.
Twoim celem jest przekucie otrzymanej listy SZKICÓW (Planów) na konkretne treści zadań z dokładną, jednoznaczną odpowiedzią liczbową.

POZIOM TRUDNOŚCI ZADAŃ: {difficulty}

LISTA SZKICÓW ZADAŃ DO ZREALIZOWANIA (ZAPLANOWANE PRZEZ METODYKA W FORMACIE JSON):
{blueprints_json}

KONTEKST EDUKACYJNY (DO ZACHOWANIA ZGODNOŚCI):
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Wiedza uprzednia ucznia: {known_topics_names} | {known_subtopics_theories}
ZAKAZANY MATERIAŁ (Absolutny zakaz pojęć z tych działów): {unknown_topics_names}

TWOJE WYTYCZNE DLA KAŻDEGO SZKICU:
1. Realizacja: Wypełnij szkic konkretnymi, sensownymi liczbami. Przeprowadź w głowie obliczenia, aby mieć pewność, że wynik końcowy jest poprawny i jednoznaczny.
2. Jakość merytoryczna: Treść zadania musi być jasna, jednoznaczna i nie budzić wątpliwości.
3. Odpowiedź: Podaj JEDNĄ poprawną odpowiedź jako string. Może to być:
   - Liczba całkowita: "17"
   - Ułamek zwykły: "3/4"
   - Liczba dziesiętna: "0.75"
   - Wyrażenie: "2\\sqrt{{3}}"
4. Ograniczenie wiedzy: BEZWZGLĘDNIE trzymaj się zasady, by nie używać pojęć nieznanych uczniowi.
5. Formatowanie: Używaj czystego tekstu z prostym ujęciem LaTeX dla matematyki.
6. Sens fizyczny wielkości policzalnych: Wszystkie rzeczy fizyczne i policzalne muszą być liczbami całkowitymi.

Zwróć TYLKO czysty JSON jako LISTĘ obiektów:
[
  {{
    "question": "Treść zadania (surowy tekst z prostym texem)",
    "correct_answer": "17"
  }}
]
""")

SOLVER_PROMPT_OPEN = ChatPromptTemplate.from_template("""
Jesteś rygorystycznym matematykiem i egzaminatorem. Otrzymujesz surową paczkę zadań otwartych (z odpowiedzią liczbową) od innego nauczyciela.

KONTEKST EDUKACYJNY UCZNIA:
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Wiedza uprzednia ucznia (Z tego możesz korzystać): {known_topics_names} | {known_subtopics_theories}
Nieznane tematy (ABSOLUTNY ZAKAZ UŻYWANIA): {unknown_topics_names}

SUROWA PACZKA ZADAŃ (JSON):
{tasks_batch_json}

ZADANIE DLA KAŻDEGO ELEMENTU Z PACZKI:
1. Rozwiąż zadanie od zera krok po kroku, nie patrząc na "correct_answer" sugerowany przez AI.
2. Pisz BARDZO PROSTYM i zrozumiałym językiem.
3. OGRANICZENIA WIEDZY (KRYTYCZNE): Uczeń zna TYLKO zagadnienia z bieżącej teorii i wiedzy uprzedniej. Rozwiązanie musi być oparte na najprostszych, aktualnie dostępnych metodach.
4. Sprawdź, czy podana odpowiedź jest poprawna i jednoznaczna.
5. Jeśli odpowiedź jest wieloznaczna (np. równanie ma 2 rozwiązania), oznacz zadanie jako niepoprawne.

Zwróć TYLKO czysty JSON jako listę wyników w tej samej kolejności:
[
  {{
    "task_index": 0,
    "raw_solution": "Twoje szczegółowe rozwiązanie krok po kroku...",
    "is_valid": true,
    "solved_answer": "17",
    "error_reason": null
  }}
]
""")

FORMATTER_PROMPT_OPEN = ChatPromptTemplate.from_template("""
Jesteś głównym projektantem wizualnym (Typesetter) platformy edukacyjnej. Znasz perfekcyjnie zasady LaTeX oraz rygorystyczne zasady struktury JSON.
Otrzymujesz surowe treści zadań otwartych (odpowiedź liczbowa) połączone z notatkami ich rozwiązania.
Twoim JEDYNYM celem jest przepisanie ich do w pełni sformatowanego, estetycznego obiektu JSON zgodnego ze schematem bazy danych.

SUROWE DANE WEJŚCIOWE (ZADANIA + ROZWIĄZANIA):
{merged_batch_json}

KRYTYCZNE ZASADY FORMATOWANIA (JSON I LATEX):
1. ZNACZNIKI MATEMATYKI: Każda liczba, zmienna i wzór MUSZĄ być w LaTeX ($...$ w tekście, $$...$$ w nowej linii dla dużych równań). Dotyczy to treści i rozwiązań.
2. JSON ESCAPING (BEZWZGLĘDNIE WAŻNE): Każda komenda LaTeX (ukośnik) musi zostać ucieczkowana dwukrotnie! Np. napisz "\\\\frac" zamiast \\frac.
3. Zadbaj o estetykę i poprawne łamanie linii (BARDZO WAŻNE):
   - ABSOLUTNY ZAKAZ wprowadzania wielu definicji ciągiem w jednej linii tekstu.
   - Wymień je pod sobą w JEDNYM wieloliniowym bloku matematycznym $$...$$.
   - Wnętrze bloku matematycznego $$...$$ przełamuj podwójnym ukośnikiem LaTeX.
   - Jeśli w bloku $$...$$ łamiesz linię z "wysokimi" strukturami (ułamki, granice, sumy), BEZWZGLĘDNIE dodaj odstęp pionowy: "\\\\\\\\[15pt]".
   - W zwykłym tekście (poza $$) zabrania się używania "\\\\\\\\" do nowej linii - używaj "\\n".
   - Pojedyncze liczby i wyrażenia będące CZĘŚCIĄ ZDANIA umieszczaj w $...$ (inline math).
   - ABSOLUTNY ZAKAZ używania podwójnych dolarów $$...$$ wewnątrz zdań.
4. CORRECT_ANSWER: Odpowiedź w polu "correct_answer" sformatuj jako czysty string LaTeX (np. "$17$", "$\\\\frac{{3}}{{4}}$").
5. TABELE I STRUKTURY DANYCH: Stosuj tabelę WYŁĄCZNIE gdy treść zadania tego wymaga, używając środowiska \\\\begin{{array}} ... \\\\end{{array}}.
6. KARYGODNY BŁĄD: Nigdy nie obejmuj całych zdań znacznikami matematycznymi!

Zwróć TYLKO czystą listę JSON z przepisanymi zadaniami:
[
  {{
    "difficulty_level": "{difficulty}",
    "content": {{
      "question": "Sformatowana w piękny $LaTeX$ treść...",
      "correct_answer": "17",
      "tolerance": 0
    }},
    "exemplary_solution": "Pięknie sformatowane w $LaTeX$ rozwiązanie krok po kroku..."
  }}
]
""")

FINAL_VALIDATOR_PROMPT_OPEN = ChatPromptTemplate.from_template("""
Jesteś głównym audytorem systemowym (Ostatnia Instancja). Cel: sprawdzić czy struktura zadania otwartego jest idealna do bazy danych.

ZADANIE DO OCENY:
{final_task_json}

KRYTERIA:
1. MATEMATYKA: Czy podany "correct_answer" jest poprawnym wynikiem zadania z "question"? Zrób rygorystyczny przegląd rachunków.
2. JEDNOZNACZNOŚĆ: Czy zadanie ma DOKŁADNIE JEDNĄ poprawną odpowiedź? Jeśli możliwe jest wiele odpowiedzi, odrzuć (is_perfect: false).
3. ROZWIĄZANIE: Czy zadanie posiada "exemplary_solution" i nie jest to wartość pusta?
4. FORMAT: Czy WSZYSTKIE liczby i zmienne są w znacznikach $...$ lub $$...$$?
5. SENS FIZYCZNY I POLICZALNOŚĆ (OBIEKTY DYSKRETNE VS WIELKOŚCI CIĄGŁE):
   a) Liczności obiektów dyskretnych/niepodzielnych oraz liczba powtórzeń (np. liczba osób, uczniów, zwierząt/stworzeń, rzutów kostką/monetą, kul, kart, losów, wierzchołków, sztuk towaru) BEZWZGLĘDNIE MUSZĄ być liczbami całkowitymi (nie może być 2,5 osoby ani 3,5 rzutu).
   b) Ciągłe wielkości fizyczne i pomiarowe (np. masa w kg/g, długość w m, czas, temperatura, kwoty pieniężne w zł, pole, objętość) JAK NAJBARDZIEJ MOGĄ być liczbami dziesiętnymi lub ułamkami (np. 10,25 kg, 12,5 kg, 2,5 m to w pełni poprawne dane). NIGDY nie odrzucaj zadania za ułamkowe masy, długości, czas czy ceny.
6. SPÓJNOŚĆ: Czy "correct_answer" jest zapisany w formacie, który uczeń może jednoznacznie wpisać?

Zwróć TYLKO czysty JSON:
{{
  "reasoning": "Przeprowadź końcowy audyt formatu i matematyki...",
  "is_perfect": true,
  "feedback": "Jeśli is_perfect to false, opisz krótko błąd. Jeśli true, wpisz null."
}}
""")


# ============================================================
# PROMPTY DLA ZADAŃ PRAWDA/FAŁSZ (TRUE_FALSE)
# Styl polskiej matury: pytanie wstępne + 2-4 stwierdzeń P/F
# ============================================================

PLANNER_PROMPT_TF = ChatPromptTemplate.from_template("""
Jesteś głównym metodykiem i twórcą koncepcji dydaktycznych. Twoim zadaniem jest zaplanowanie SZKICÓW (konceptów) do {count} zadań typu PRAWDA/FAŁSZ w stylu polskiej matury na poziomie: {difficulty}.
Tworzysz materiały WYŁĄCZNIE na poziomie podstawowym dla szkoły średniej w Polsce (matura podstawowa).
Ty nie rozwiązujesz zadań, ani nie tworzysz dokładnych odpowiedzi (tym zajmie się Generator w kolejnym kroku). Twoim celem jest wymyślenie zróżnicowanych, merytorycznie spójnych i ciekawych pomysłów ("szkieletów" zadań), które rygorystycznie przestrzegają obostrzeń wiedzy ucznia.

FORMAT ZADANIA: Uczeń otrzymuje kontekst (np. "Dana jest funkcja f(x) = ...") oraz 2-4 stwierdzenia. Każde stwierdzenie uczeń ocenia niezależnie jako PRAWDA lub FAŁSZ. To jest klasyczny format z polskiej matury podstawowej.

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
   - Easy: Stwierdzenia sprawdzające definicje, proste własności. Prawdziwość oczywista po chwili zastanowienia.
   - Medium: Stwierdzenia wymagające krótkiego obliczenia lub analizy (np. sprawdzenie czy punkt leży na wykresie).
   - Hard: Stwierdzenia wymagające połączenia kilku koncepcji, jedno stwierdzenie może być podchwytliwe.
   - Very Hard: Stwierdzenia z ukrytymi haczykami, wymagające głębszej analizy lub rozpoznania przypadku szczególnego.
2. Ograniczenie wiedzy (STRICT): Absolutnie nie planuj używania pojęć z "Zakazanego materiału".
3. Separacja: Upewnij się, że szkic celuje w grupę "{group}".
4. Różnorodność: Każdy z {count} szkiców musi mieć INNY kontekst.
5. Wartości logiczne: Każde stwierdzenie planuj w oparciu o czystą matematykę. Dopuszczalna jest dowolna kombinacja (np. wszystkie fałszywe, wszystkie prawdziwe lub mieszane).
6. Liczba stwierdzeń: Zaplanuj od 2 do 4 stwierdzeń na jedno zadanie (najczęściej 3).
7. Inspiracja wizjonerska: {inspiration}
8. Random Seed: {random_seed} (dla unikalności).
9. Użycie tabeli (STRICT): Tabelę planuj TYLKO wtedy, gdy nazwa grupy tego wymaga.

Zwróć TYLKO czysty JSON jako listę dokładnie {count} obiektów:
[
  {{
    "task_concept": "Opisz kontekst zadania (np. Dana jest funkcja kwadratowa f(x)=x^2-4x+3). Wymień ogólnie jakie stwierdzenia planujesz (np. o miejscach zerowych, o wierzchołku, o monotoniczności).",
    "num_statements": 3,
    "planned_balance": "np. 2 prawdziwe, 1 fałszywe",
    "trap_or_trick": "Opisz czy jest tu jakiś haczyk w którymś ze stwierdzeń.",
    "math_tools_required": "Z jakiej wiedzy uczeń musi skorzystać"
  }}
]
""")

GENERATOR_PROMPT_TF = ChatPromptTemplate.from_template("""
Jesteś precyzyjnym konstruktorem zadań matematycznych (Realizatorem). Tworzysz wybitne zadania typu PRAWDA/FAŁSZ w stylu polskiej matury na poziomie podstawowym dla polskiej szkoły średniej.
Twoim celem jest przekucie otrzymanej listy SZKICÓW (Planów) na konkretne treści zadań z precyzyjnie skonstruowanymi stwierdzeniami.

POZIOM TRUDNOŚCI ZADAŃ: {difficulty}

LISTA SZKICÓW ZADAŃ DO ZREALIZOWANIA (ZAPLANOWANE PRZEZ METODYKA W FORMACIE JSON):
{blueprints_json}

KONTEKST EDUKACYJNY (DO ZACHOWANIA ZGODNOŚCI):
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Wiedza uprzednia ucznia: {known_topics_names} | {known_subtopics_theories}
ZAKAZANY MATERIAŁ (Absolutny zakaz pojęć z tych działów): {unknown_topics_names}

TWOJE WYTYCZNE DLA KAŻDEGO SZKICU:
1. Realizacja: Wypełnij szkic konkretnymi danymi. Przeprowadź w głowie obliczenia dla każdego stwierdzenia.
2. Pytanie wstępne: Sformułuj kontekst zadania (np. "Dany jest ciąg arytmetyczny o a_1 = 3 i r = 5. Oceń prawdziwość poniższych stwierdzeń.").
3. Stwierdzenia: Wygeneruj od 2 do 4 stwierdzeń. Każde MUSI być jednoznacznie PRAWDZIWE albo FAŁSZYWE. Fałszywe stwierdzenia powinny wynikać z typowych błędów uczniów (np. pomylenie znaku, zapomnienie o warunku).
4. Wartości logiczne: Dopuszczalna jest dowolna kombinacja (np. wszystkie fałszywe, wszystkie prawdziwe lub mieszane) — decyduje wyłącznie rzetelna matematyka.
5. Ograniczenie wiedzy: BEZWZGLĘDNIE trzymaj się zasady, by nie używać pojęć nieznanych uczniowi.
6. Formatowanie: Używaj czystego tekstu z prostym ujęciem LaTeX.
7. Sens fizyczny: Wielkości policzalne muszą być liczbami całkowitymi.

Zwróć TYLKO czysty JSON jako LISTĘ obiektów:
[
  {{
    "question": "Pytanie wstępne z kontekstem (surowy tekst z LaTeX)",
    "statements": [
      {{"text": "Treść stwierdzenia 1", "correct": true}},
      {{"text": "Treść stwierdzenia 2", "correct": false}},
      {{"text": "Treść stwierdzenia 3", "correct": true}}
    ]
  }}
]
""")

SOLVER_PROMPT_TF = ChatPromptTemplate.from_template("""
Jesteś rygorystycznym matematykiem i egzaminatorem. Otrzymujesz surową paczkę zadań typu PRAWDA/FAŁSZ od innego nauczyciela.

KONTEKST EDUKACYJNY UCZNIA:
Ścieżka: {chapter} > {topic} > {subtopic} > {group}
Teoria bieżąca: {topic_theory}, {subtopic_theory}
Wiedza uprzednia ucznia (Z tego możesz korzystać): {known_topics_names} | {known_subtopics_theories}
Nieznane tematy (ABSOLUTNY ZAKAZ UŻYWANIA): {unknown_topics_names}

SUROWA PACZKA ZADAŃ (JSON):
{tasks_batch_json}

ZADANIE DLA KAŻDEGO ELEMENTU Z PACZKI:
1. Dla KAŻDEGO stwierdzenia w zadaniu: rozwiąż/sprawdź od zera, nie patrząc na sugerowany "correct".
2. Pisz BARDZO PROSTYM i zrozumiałym językiem.
3. OGRANICZENIA WIEDZY (KRYTYCZNE): Rozwiązanie musi być oparte na najprostszych, aktualnie dostępnych metodach.
4. Sprawdź, czy każde stwierdzenie jest JEDNOZNACZNIE prawdziwe lub fałszywe. Jeśli któreś jest niejednoznaczne, oznacz zadanie jako niepoprawne.
5. Sprawdź, czy NIE wszystkie stwierdzenia mają tę samą wartość (nie wszystkie P lub nie wszystkie F).

Zwróć TYLKO czysty JSON jako listę wyników:
[
  {{
    "task_index": 0,
    "raw_solution": "Twoje szczegółowe rozwiązanie/uzasadnienie każdego stwierdzenia...",
    "is_valid": true,
    "solved_statements": [true, false, true],
    "error_reason": null
  }}
]
""")

FORMATTER_PROMPT_TF = ChatPromptTemplate.from_template("""
Jesteś głównym projektantem wizualnym (Typesetter) platformy edukacyjnej. Znasz perfekcyjnie zasady LaTeX oraz rygorystyczne zasady struktury JSON.
Otrzymujesz surowe treści zadań PRAWDA/FAŁSZ połączone z notatkami ich rozwiązania.
Twoim JEDYNYM celem jest przepisanie ich do w pełni sformatowanego, estetycznego obiektu JSON.

SUROWE DANE WEJŚCIOWE (ZADANIA + ROZWIĄZANIA):
{merged_batch_json}

KRYTYCZNE ZASADY FORMATOWANIA (JSON I LATEX):
1. ZNACZNIKI MATEMATYKI: Każda liczba, zmienna i wzór MUSZĄ być w LaTeX ($...$ w tekście, $$...$$ w nowej linii dla dużych równań). Dotyczy to pytania wstępnego, stwierdzeń i rozwiązań.
2. JSON ESCAPING (BEZWZGLĘDNIE WAŻNE): Każda komenda LaTeX musi zostać ucieczkowana dwukrotnie! Np. "\\\\frac" zamiast \\frac.
3. Zadbaj o estetykę i poprawne łamanie linii (BARDZO WAŻNE):
   - ABSOLUTNY ZAKAZ wprowadzania wielu definicji ciągiem w jednej linii tekstu.
   - Wnętrze bloku $$...$$ przełamuj podwójnym ukośnikiem LaTeX.
   - Jeśli w bloku $$...$$ łamiesz linię z "wysokimi" strukturami, dodaj "\\\\\\\\[15pt]".
   - W zwykłym tekście używaj "\\n".
   - Pojedyncze liczby i wyrażenia będące CZĘŚCIĄ ZDANIA umieszczaj w $...$.
   - ABSOLUTNY ZAKAZ używania podwójnych dolarów wewnątrz zdań.
4. STWIERDZENIA: Każde stwierdzenie powinno być samodzielnym, czytelnym zdaniem z poprawnym formatowaniem LaTeX. Zachowaj id numeryczne (1, 2, 3, ...).
5. TABELE: Stosuj WYŁĄCZNIE gdy treść tego wymaga.
6. KARYGODNY BŁĄD: Nigdy nie obejmuj całych zdań znacznikami matematycznymi!

Zwróć TYLKO czystą listę JSON z przepisanymi zadaniami:
[
  {{
    "difficulty_level": "{difficulty}",
    "content": {{
      "question": "Sformatowane w piękny $LaTeX$ pytanie wstępne z kontekstem...",
      "statements": [
        {{"id": 1, "text": "Sformatowane stwierdzenie 1", "correct": true}},
        {{"id": 2, "text": "Sformatowane stwierdzenie 2", "correct": false}},
        {{"id": 3, "text": "Sformatowane stwierdzenie 3", "correct": true}}
      ]
    }},
    "exemplary_solution": "Pięknie sformatowane w $LaTeX$ uzasadnienie każdego stwierdzenia krok po kroku..."
  }}
]
""")

FINAL_VALIDATOR_PROMPT_TF = ChatPromptTemplate.from_template("""
Jesteś głównym audytorem systemowym (Ostatnia Instancja). Cel: sprawdzić czy struktura zadania PRAWDA/FAŁSZ jest idealna do bazy danych.

ZADANIE DO OCENY:
{final_task_json}

KRYTERIA:
1. MATEMATYKA: Czy każde stwierdzenie z "statements" jest na pewno poprawnie oznaczone jako true/false? Sprawdź każde stwierdzenie od zera, przeprowadzając rachunki.
2. JEDNOZNACZNOŚĆ: Czy KAŻDE stwierdzenie jest jednoznacznie prawdziwe ALBO fałszywe? Niejednoznaczne stwierdzenia dyskwalifikują zadanie.
3. WARTOŚCI LOGICZNE: Dopuszczalna jest DOWOLNA kombinacja (np. wszystkie stwierdzenia mogą być fałszywe, wszystkie prawdziwe lub mieszane). NIGDY nie odrzucaj zadania z powodu braku balansu P/F.
4. ROZWIĄZANIE: Czy "exemplary_solution" zawiera uzasadnienie KAŻDEGO stwierdzenia?
5. FORMAT: Czy WSZYSTKIE liczby i zmienne są w znacznikach $...$ lub $$...$$?
6. SENS FIZYCZNY I POLICZALNOŚĆ (OBIEKTY DYSKRETNE VS WIELKOŚCI CIĄGŁE):
   a) Liczności obiektów dyskretnych/niepodzielnych oraz liczba powtórzeń (np. liczba osób, uczniów, zwierząt/stworzeń, rzutów kostką/monetą, kul, kart, losów, wierzchołków, sztuk towaru) BEZWZGLĘDNIE MUSZĄ być liczbami całkowitymi (nie może być 2,5 osoby ani 3,5 rzutu).
   b) Ciągłe wielkości fizyczne i pomiarowe (np. masa w kg/g, długość w m, czas, temperatura, kwoty pieniężne w zł, pole, objętość) JAK NAJBARDZIEJ MOGĄ być liczbami dziesiętnymi lub ułamkami (np. 10,25 kg, 2,5 m to w pełni poprawne dane). NIGDY nie odrzucaj zadania za ułamkowe masy, długości czy ceny.
7. STRUKTURA: Czy "statements" to lista obiektów z polami "id" (int), "text" (string) i "correct" (boolean)?

Zwróć TYLKO czysty JSON:
{{
  "reasoning": "Przeprowadź końcowy audyt formatu, matematyki i poprawności stwierdzeń...",
  "is_perfect": true,
  "feedback": "Jeśli is_perfect to false, opisz krótko błąd. Jeśli true, wpisz null."
}}
""")