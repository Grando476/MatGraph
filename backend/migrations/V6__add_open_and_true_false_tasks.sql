-- Migration V6: Add example OPEN and TRUE_FALSE tasks to each subtopic
-- Schema complies with task_schemas.json

INSERT INTO public.tasks (id, task_group_id, task_type, content, difficulty_level, exemplary_solution, human_validated)
VALUES
    -- =========================================================================
    -- TOPIC 1: Równania i Nierówności
    -- =========================================================================

    -- Subtopic 1: Równania liniowe z jedną niewiadomą (a1111111-0000-0000-0000-000000000001)
    -- Group: Proste równania liniowe (b1110001-0000-0000-0000-000000000001)
    (
        'd1110001-0000-0000-0000-000000000001',
        'b1110001-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Rozwiąż równanie: $$ 5x - 7 = 3x + 9 $$. Wpisz otrzymaną wartość $$ x $$.",
            "question_image_url": null,
            "correct_answer": "8",
            "tolerance": 0
        }'::jsonb,
        'Easy',
        'Przenosimy wyrazy z niewiadomą na lewą stronę, a liczby na prawą: $$ 5x - 3x = 9 + 7 $$, co daje $$ 2x = 16 $$. Dzielimy obie strony przez 2: $$ x = 8 $$.',
        TRUE
    ),
    (
        'd1110001-0000-0000-0000-000000000002',
        'b1110001-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Rozważ równanie liniowe $$ 4(x - 2) = 2(2x - 3) $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Dla $$ x = 0 $$ lewa strona równania jest równa $$-8$$.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Równanie to ma dokładnie jedno rozwiązanie rzeczywiste.",
                    "correct": false
                },
                {
                    "id": 3,
                    "text": "Równanie jest sprzeczne i nie posiada rozwiązań.",
                    "correct": true
                }
            ]
        }'::jsonb,
        'Medium',
        '1. Prawda: Dla $$ x = 0 $$ lewa strona wynosi $$ 4(0 - 2) = 4 \cdot (-2) = -8 $$.
2. Fałsz: Przekształcając równanie: $$ 4x - 8 = 4x - 6 $$, odejmując $$ 4x $$ stronami otrzymujemy $$ -8 = -6 $$, co jest sprzecznością.
3. Prawda: Otrzymana sprzeczność oznacza, że żadna liczba nie spełnia równania – jest ono sprzeczne.',
        TRUE
    ),

    -- Subtopic 2: Nierówności liniowe (a1111111-0000-0000-0000-000000000002)
    -- Group: Nierówności stopnia pierwszego (b1110002-0000-0000-0000-000000000001)
    (
        'd1110002-0000-0000-0000-000000000001',
        'b1110002-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Podaj największą liczbę całkowitą spełniającą nierówność: $$ -3x + 5 > -7 $$.",
            "question_image_url": null,
            "correct_answer": "3",
            "tolerance": 0
        }'::jsonb,
        'Easy',
        'Odejmujemy 5 od obu stron nierówności: $$ -3x > -12 $$. Dzielimy obie strony przez $$ -3 $$, zmieniając zwrot znaku nierówności na przeciwny: $$ x < 4 $$. Największą liczbą całkowitą spełniającą warunek $$ x < 4 $$ jest liczba 3.',
        TRUE
    ),
    (
        'd1110002-0000-0000-0000-000000000002',
        'b1110002-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Dana jest nierówność liniowa $$ 2(x + 1) \\le 4x - 6 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Zbiorem rozwiązań nierówności jest przedział $$ \\langle 4, +\\infty) $$.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Liczba $$ x = 3 $$ należy do zbioru rozwiązań tej nierówności.",
                    "correct": false
                },
                {
                    "id": 3,
                    "text": "Najmniejszą liczbą całkowitą spełniającą tę nierówność jest 4.",
                    "correct": true
                }
            ]
        }'::jsonb,
        'Medium',
        'Wymnażamy nawias: $$ 2x + 2 \le 4x - 6 $$. Przenosimy wyrazy: $$ 2 + 6 \le 4x - 2x $$, czyli $$ 8 \le 2x $$, co po podzieleniu przez 2 daje $$ x \ge 4 $$.
1. Prawda: Zbiorem rozwiązań jest przedział domknięty $$ \langle 4, +\infty) $$.
2. Fałsz: Liczba 3 jest mniejsza od 4, więc nie należy do przedziału rozwiązań.
3. Prawda: Ponieważ przedział jest lewostronnie domknięty w 4, najmniejszą liczbą całkowitą spełniającą nierówność jest 4.',
        TRUE
    ),

    -- Subtopic 3: Układy równań liniowych (a1111111-0000-0000-0000-000000000003)
    -- Group: Metoda podstawiania (b1110003-0000-0000-0000-000000000001)
    (
        'd1110003-0000-0000-0000-000000000001',
        'b1110003-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Rozwiąż układ równań: $$ \\begin{cases} 2x + y = 11 \\\\ x - y = 1 \\end{cases} $$. Oblicz wartość iloczynu $$ x \\cdot y $$.",
            "question_image_url": null,
            "correct_answer": "12",
            "tolerance": 0
        }'::jsonb,
        'Medium',
        'Dodajemy oba równania stronami: $$ (2x + y) + (x - y) = 11 + 1 $$, skąd $$ 3x = 12 $$, czyli $$ x = 4 $$. Podstawiamy $$ x = 4 $$ do drugiego równania: $$ 4 - y = 1 \implies y = 3 $$. Iloczyn rozwiązań wynosi: $$ x \cdot y = 4 \cdot 3 = 12 $$.',
        TRUE
    ),
    (
        'd1110003-0000-0000-0000-000000000002',
        'b1110003-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Rozważ układ równań $$ \\begin{cases} 3x - 2y = 7 \\\\ 6x - 4y = 14 \\end{cases} $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Para liczb $$ x = 3, y = 1 $$ spełnia ten układ równań.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Układ ten posiada dokładnie jedno rozwiązanie.",
                    "correct": false
                },
                {
                    "id": 3,
                    "text": "Układ ten jest układem nieoznaczonym i posiada nieskończenie wiele rozwiązań.",
                    "correct": true
                }
            ]
        }'::jsonb,
        'Easy',
        '1. Prawda: Podstawiając $$ x = 3, y = 1 $$: pierwsze równanie daje $$ 3 \cdot 3 - 2 \cdot 1 = 9 - 2 = 7 $$, a drugie $$ 6 \cdot 3 - 4 \cdot 1 = 18 - 4 = 14 $$. Obie równości są spełnione.
2. Fałsz: Drugie równanie powstaje przez pomnożenie pierwszego obustronnie przez 2. Równania są tożsame, więc układ ma nieskończenie wiele rozwiązań.
3. Prawda: Układ dwóch równań zależnych liniowo ma nieskończenie wiele rozwiązań (jest to układ nieoznaczony).',
        TRUE
    ),

    -- =========================================================================
    -- TOPIC 2: Funkcja Kwadratowa
    -- =========================================================================

    -- Subtopic 4: Postać ogólna i wyróżnik delta (a2222222-0000-0000-0000-000000000001)
    -- Group: Obliczanie delty (b2220001-0000-0000-0000-000000000001)
    (
        'd2220001-0000-0000-0000-000000000001',
        'b2220001-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Oblicz wyróżnik $$ \\Delta $$ dla funkcji kwadratowej: $$ f(x) = 2x^2 - 6x - 5 $$.",
            "question_image_url": null,
            "correct_answer": "76",
            "tolerance": 0
        }'::jsonb,
        'Easy',
        'Współczynniki funkcji wynoszą: $$ a = 2 $$, $$ b = -6 $$, $$ c = -5 $$. Wzór na wyróżnik: $$ \Delta = b^2 - 4ac $$. Podstawiamy: $$ \Delta = (-6)^2 - 4 \cdot 2 \cdot (-5) = 36 - (-40) = 36 + 40 = 76 $$.',
        TRUE
    ),
    (
        'd2220001-0000-0000-0000-000000000002',
        'b2220001-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Dana jest funkcja kwadratowa $$ f(x) = x^2 - 8x + 16 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Wyróżnik $$ \\Delta $$ tej funkcji wynosi 0.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Funkcja ma dwa różne miejsca zerowe.",
                    "correct": false
                },
                {
                    "id": 3,
                    "text": "Jedynym miejscem zerowym funkcji jest liczba $$ x = 4 $$.",
                    "correct": true
                }
            ]
        }'::jsonb,
        'Easy',
        'Współczynniki to: $$ a = 1, b = -8, c = 16 $$.
1. Prawda: $$ \Delta = (-8)^2 - 4 \cdot 1 \cdot 16 = 64 - 64 = 0 $$.
2. Fałsz: Skoro $$ \Delta = 0 $$, funkcja posiada dokładnie jedno (podwójne) miejsce zerowe, a nie dwa różne.
3. Prawda: Miejsce zerowe to $$ x_0 = -\frac{b}{2a} = -\frac{-8}{2 \cdot 1} = 4 $$.',
        TRUE
    ),

    -- Subtopic 5: Wierzchołek paraboli (a2222222-0000-0000-0000-000000000002)
    -- Group: Wyznaczanie współrzędnej p (b2220002-0000-0000-0000-000000000001)
    (
        'd2220002-0000-0000-0000-000000000001',
        'b2220002-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Dana jest funkcja kwadratowa $$ f(x) = -x^2 + 4x + 7 $$. Oblicz największą wartość tej funkcji (współrzędną $$ q $$ wierzchołka).",
            "question_image_url": null,
            "correct_answer": "11",
            "tolerance": 0
        }'::jsonb,
        'Medium',
        'Współczynniki to $$ a = -1 $$, $$ b = 4 $$, $$ c = 7 $$. Ponieważ $$ a < 0 $$, ramiona paraboli skierowane są w dół, więc największą wartość funkcja osiąga w wierzchołku. Współrzędna $$ p = -\frac{b}{2a} = -\frac{4}{2 \cdot (-1)} = 2 $$. Największa wartość to $$ q = f(p) = -(2)^2 + 4 \cdot 2 + 7 = -4 + 8 + 7 = 11 $$.',
        TRUE
    ),
    (
        'd2220002-0000-0000-0000-000000000002',
        'b2220002-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Dana jest funkcja kwadratowa w postaci kanonicznej $$ f(x) = 2(x - 3)^2 - 5 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Współrzędne wierzchołka paraboli to $$ W = (3, -5) $$.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Prosta o równaniu $$ x = 3 $$ jest osią symetrii paraboli.",
                    "correct": true
                },
                {
                    "id": 3,
                    "text": "Największa wartość tej funkcji wynosi $$-5$$.",
                    "correct": false
                }
            ]
        }'::jsonb,
        'Easy',
        '1. Prawda: Ze wzoru kanonicznego $$ f(x) = a(x - p)^2 + q $$ bezpośrednio odczytujemy $$ p = 3 $$ oraz $$ q = -5 $$, więc $$ W = (3, -5) $$.
2. Prawda: Osią symetrii każdej paraboli jest pionowa prosta przechodząca przez wierzchołek: $$ x = p $$, czyli $$ x = 3 $$.
3. Fałsz: Ponieważ $$ a = 2 > 0 $$, ramiona paraboli są skierowane w górę, zatem $$ q = -5 $$ jest najmniejszą, a nie największą wartością funkcji.',
        TRUE
    ),

    -- Subtopic 6: Postać kanoniczna i iloczynowa (a2222222-0000-0000-0000-000000000003)
    -- Group: Przekształcanie do postaci kanonicznej (b2220003-0000-0000-0000-000000000001)
    (
        'd2220003-0000-0000-0000-000000000001',
        'b2220003-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Miejscami zerowymi funkcji kwadratowej $$ f(x) = a(x - 2)(x + 4) $$ są liczby 2 oraz $$-4$$. Wykres funkcji przecina oś OY w punkcie $$ (0, -16) $$. Wyznacz wartość współczynnika $$ a $$.",
            "question_image_url": null,
            "correct_answer": "2",
            "tolerance": 0
        }'::jsonb,
        'Medium',
        'Skoro punkt $$ (0, -16) $$ leży na wykresie funkcji, to $$ f(0) = -16 $$. Podstawiamy $$ x = 0 $$ do wzoru: $$ f(0) = a(0 - 2)(0 + 4) = a \cdot (-2) \cdot 4 = -8a $$. Otrzymujemy równanie: $$ -8a = -16 $$, skąd po podzieleniu przez $$-8$$ mamy $$ a = 2 $$.',
        TRUE
    ),
    (
        'd2220003-0000-0000-0000-000000000002',
        'b2220003-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Rozważ funkcję kwadratową daną w postaci kanonicznej $$ f(x) = -(x + 1)^2 + 9 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Postać iloczynowa tej funkcji to $$ f(x) = -(x - 2)(x + 4) $$.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Dla $$ x \\in (-4, 2) $$ funkcja przyjmuje wartości dodatnie.",
                    "correct": true
                },
                {
                    "id": 3,
                    "text": "Wykres funkcji nie posiada punktu wspólnego z osią OY.",
                    "correct": false
                }
            ]
        }'::jsonb,
        'Medium',
        'Wyznaczamy miejsca zerowe: $$ -(x + 1)^2 + 9 = 0 \implies (x + 1)^2 = 9 $$, zatem $$ x + 1 = 3 \implies x = 2 $$ lub $$ x + 1 = -3 \implies x = -4 $$.
1. Prawda: Przy współczynniku $$ a = -1 $$ postać iloczynowa to $$ f(x) = -(x - 2)(x - (-4)) = -(x - 2)(x + 4) $$.
2. Prawda: Parabola ma ramiona skierowane w dół ($$ a = -1 < 0 $$), więc między miejscami zerowymi, czyli dla $$ x \in (-4, 2) $$, wykres leży nad osią OX ($$ f(x) > 0 $$).
3. Fałsz: Każda funkcja kwadratowa przecina oś OY w punkcie $$ (0, f(0)) $$. Tutaj $$ f(0) = -(0 + 1)^2 + 9 = 8 $$, czyli punktem przecięcia jest $$ (0, 8) $$.',
        TRUE
    ),

    -- =========================================================================
    -- TOPIC 3: Ciągi Liczbowe
    -- =========================================================================

    -- Subtopic 7: Wzór ogólny ciągu (a3333333-0000-0000-0000-000000000001)
    -- Group: Obliczanie wyrazów ciągu (b3330001-0000-0000-0000-000000000001)
    (
        'd3330001-0000-0000-0000-000000000001',
        'b3330001-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "Dany jest ciąg określony wzorem ogólnym $$ a_n = 2n^2 - 3n + 5 $$ dla $$ n \\ge 1 $$. Oblicz wartość wyrazu $$ a_5 $$.",
            "question_image_url": null,
            "correct_answer": "40",
            "tolerance": 0
        }'::jsonb,
        'Easy',
        'Podstawiamy $$ n = 5 $$ do wzoru ciągu: $$ a_5 = 2 \cdot (5)^2 - 3 \cdot 5 + 5 = 2 \cdot 25 - 15 + 5 = 50 - 15 + 5 = 40 $$.',
        TRUE
    ),
    (
        'd3330001-0000-0000-0000-000000000002',
        'b3330001-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Dany jest ciąg o wyrazie ogólnym $$ a_n = 5 - 2n $$ dla $$ n \\ge 1 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Pierwszy wyraz tego ciągu jest równy 3.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Ciąg ten jest ciągiem rosnącym.",
                    "correct": false
                },
                {
                    "id": 3,
                    "text": "Liczba $$-15$$ jest wyrazem tego ciągu.",
                    "correct": true
                }
            ]
        }'::jsonb,
        'Easy',
        '1. Prawda: Dla $$ n = 1 $$ mamy $$ a_1 = 5 - 2 \cdot 1 = 3 $$.
2. Fałsz: Różnica $$ a_{n+1} - a_n = (5 - 2(n + 1)) - (5 - 2n) = -2 < 0 $$, więc ciąg jest malejący.
3. Prawda: Rozwiązujemy równanie $$ 5 - 2n = -15 \implies 2n = 20 \implies n = 10 $$. Ponieważ $$ 10 \in \mathbb{N}_+ $$, wyraz $$ a_{10} = -15 $$.',
        TRUE
    ),

    -- Subtopic 8: Ciąg arytmetyczny (a3333333-0000-0000-0000-000000000002)
    -- Group: Wyznaczanie różnicy r (b3330002-0000-0000-0000-000000000001)
    (
        'd3330002-0000-0000-0000-000000000001',
        'b3330002-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "W ciągu arytmetycznym $$ (a_n) $$ dane są: pierwszy wyraz $$ a_1 = 4 $$ oraz różnica $$ r = 3 $$. Oblicz sumę pierwszych dziesięciu wyrazów tego ciągu ($$ S_{10} $$).",
            "question_image_url": null,
            "correct_answer": "175",
            "tolerance": 0
        }'::jsonb,
        'Medium',
        'Obliczamy dziesiąty wyraz ciągu ze wzoru: $$ a_{10} = a_1 + 9r = 4 + 9 \cdot 3 = 4 + 27 = 31 $$. Korzystamy ze wzoru na sumę początkowych wyrazów ciągu arytmetycznego: $$ S_{10} = \frac{a_1 + a_{10}}{2} \cdot 10 = \frac{4 + 31}{2} \cdot 10 = \frac{35}{2} \cdot 10 = 35 \cdot 5 = 175 $$.',
        TRUE
    ),
    (
        'd3330002-0000-0000-0000-000000000002',
        'b3330002-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "W ciągu arytmetycznym $$ (a_n) $$ drugi wyraz wynosi $$ a_2 = 7 $$, a piąty wyraz wynosi $$ a_5 = 19 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Różnica tego ciągu wynosi $$ r = 4 $$.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Pierwszy wyraz tego ciągu jest równy 3.",
                    "correct": true
                },
                {
                    "id": 3,
                    "text": "Trzydziesty wyraz tego ciągu ($$ a_{30} $$) jest równy 120.",
                    "correct": false
                }
            ]
        }'::jsonb,
        'Medium',
        '1. Prawda: Z zależności między wyrazami: $$ a_5 - a_2 = 3r $$, zatem $$ 19 - 7 = 3r \implies 3r = 12 \implies r = 4 $$.
2. Prawda: Pierwszy wyraz to $$ a_1 = a_2 - r = 7 - 4 = 3 $$.
3. Fałsz: Trzydziesty wyraz to $$ a_{30} = a_1 + 29r = 3 + 29 \cdot 4 = 3 + 116 = 119 \ne 120 $$.',
        TRUE
    ),

    -- Subtopic 9: Ciąg geometryczny (a3333333-0000-0000-0000-000000000003)
    -- Group: Wyznaczanie ilorazu q (b3330003-0000-0000-0000-000000000001)
    (
        'd3330003-0000-0000-0000-000000000001',
        'b3330003-0000-0000-0000-000000000001',
        'OPEN',
        '{
            "question": "W rosnącym ciągu geometrycznym $$ (a_n) $$ dane są: pierwszy wyraz $$ a_1 = 3 $$ oraz trzeci wyraz $$ a_3 = 48 $$. Oblicz czwarty wyraz tego ciągu ($$ a_4 $$).",
            "question_image_url": null,
            "correct_answer": "192",
            "tolerance": 0
        }'::jsonb,
        'Medium',
        'Ze wzoru ogólnego ciągu geometrycznego: $$ a_3 = a_1 \cdot q^2 $$, czyli $$ 48 = 3 \cdot q^2 \implies q^2 = 16 $$. Ponieważ ciąg jest rosnący i ma dodatnie wyrazy, iloraz wynosi $$ q = 4 $$. Obliczamy wyraz czwarty: $$ a_4 = a_3 \cdot q = 48 \cdot 4 = 192 $$.',
        TRUE
    ),
    (
        'd3330003-0000-0000-0000-000000000002',
        'b3330003-0000-0000-0000-000000000001',
        'TRUE_FALSE',
        '{
            "question": "Dany jest ciąg geometryczny $$ (a_n) $$ o pierwszym wyrazie $$ a_1 = 5 $$ i ilorazie $$ q = 2 $$. Oceń prawdziwość poniższych stwierdzeń.",
            "question_image_url": null,
            "statements": [
                {
                    "id": 1,
                    "text": "Czwarty wyraz tego ciągu jest równy 40.",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Suma pierwszych czterech wyrazów tego ciągu wynosi 75.",
                    "correct": true
                },
                {
                    "id": 3,
                    "text": "Ciąg ten jest ciągiem naprzemiennym.",
                    "correct": false
                }
            ]
        }'::jsonb,
        'Easy',
        '1. Prawda: Czwarty wyraz to $$ a_4 = a_1 \cdot q^3 = 5 \cdot 2^3 = 5 \cdot 8 = 40 $$.
2. Prawda: Wyrazy to: $$ a_1 = 5, a_2 = 10, a_3 = 20, a_4 = 40 $$. Ich suma wynosi $$ S_4 = 5 + 10 + 20 + 40 = 75 $$.
3. Fałsz: Ponieważ iloraz $$ q = 2 > 0 $$, wszystkie wyrazy ciągu są dodatnie, więc ciąg nie jest naprzemienny (jest rosnący).',
        TRUE
    )
ON CONFLICT (id) DO NOTHING;
