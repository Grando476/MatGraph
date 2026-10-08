-- Migration V2: Insert sample data (3 Topics/Lessons, each with 3 Subtopics, each with 3 Task Groups, each with 3 Tasks)

-- 1. Insert Chapter
INSERT INTO public.chapters (id, name)
VALUES ('d5f28100-c339-46c8-92ab-709e01b41fb2', 'Matematyka Podstawowa')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 3 Topics (Lekcje w Grafie)
INSERT INTO public.topics (id, chapter_id, name, ui_x, ui_y, content_tex)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'd5f28100-c339-46c8-92ab-709e01b41fb2', 'Równania i Nierówności', -200, 100, 'Wprowadzenie do rozwiązywania równań i nierówności liniowych.'),
    ('22222222-2222-2222-2222-222222222222', 'd5f28100-c339-46c8-92ab-709e01b41fb2', 'Funkcja Kwadratowa', 0, 300, 'Własności funkcji kwadratowej, wyznaczanie delty i wierzchołka.'),
    ('33333333-3333-3333-3333-333333333333', 'd5f28100-c339-46c8-92ab-709e01b41fb2', 'Ciągi Liczbowe', 200, 500, 'Ciągi arytmetyczne oraz geometryczne w praktyce.')
ON CONFLICT (id) DO NOTHING;

-- 3. Topic Edges (Routing w Grafie)
INSERT INTO public.topic_edges (parent_id, child_id)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
    ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- 4. 9 Subtopics (3 for Topic 1, 3 for Topic 2, 3 for Topic 3)
INSERT INTO public.subtopics (id, topic_id, name, importance, sort_order, video_url, content_tex)
VALUES 
    -- Topic 1: Równania i Nierówności
    ('a1111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Równania liniowe z jedną niewiadomą', 5, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Równanie liniowe ma postać $$ a x + b = 0 $$. Sprowadzamy wyraz wolny na prawą stronę.'),
    ('a1111111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Nierówności liniowe', 4, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Przy dzieleniu nierówności przez liczbę ujemną zmieniamy zwrot znaku nierówności.'),
    ('a1111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Układy równań liniowych', 5, 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Układ dwóch równań możemy rozwiązać metodą podstawiania lub przeciwnych współczynników.'),
    -- Topic 2: Funkcja Kwadratowa
    ('a2222222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Postać ogólna i wyróżnik delta', 5, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Vademecum delty: $$ \Delta = b^2 - 4ac $$. Jeśli $$ \Delta > 0 $$, istnieją dwa rozwiązania.'),
    ('a2222222-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Wierzchołek paraboli', 4, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Współrzędne wierzchołka paraboli $$ W = (p, q) $$, gdzie $$ p = -\frac{b}{2a} $$, $$ q = -\frac{\Delta}{4a} $$.'),
    ('a2222222-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Postać kanoniczna i iloczynowa', 5, 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Postać kanoniczna to $$ f(x) = a(x-p)^2 + q $$, a iloczynowa $$ f(x) = a(x-x_1)(x-x_2) $$.'),
    -- Topic 3: Ciągi Liczbowe
    ('a3333333-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Wzór ogólny ciągu', 4, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: Ciąg to funkcja określona na zbiorze liczb naturalnych dodatnich $$ a_n = f(n) $$.'),
    ('a3333333-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Ciąg arytmetyczny', 5, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: W ciągu arytmetycznym różnica $$ r = a_{n+1} - a_n $$ jest stała. Wzór: $$ a_n = a_1 + (n-1)r $$.'),
    ('a3333333-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Ciąg geometryczny', 5, 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Teoria: W ciągu geometrycznym iloraz $$ q = \frac{a_{n+1}}{a_n} $$ jest stały. Wzór: $$ a_n = a_1 \cdot q^{n-1} $$.')
ON CONFLICT (id) DO NOTHING;

-- 5. 27 Task Groups (3 per Subtopic)
INSERT INTO public.task_groups (id, subtopic_id, name)
VALUES 
    -- Subtopic a1-1
    ('b1110001-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'Proste równania liniowe'),
    ('b1110001-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000001', 'Równania z nawiasami'),
    ('b1110001-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000001', 'Zadania tekstowe z równaniami'),
    -- Subtopic a1-2
    ('b1110002-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000002', 'Nierówności stopnia pierwszego'),
    ('b1110002-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'Nierówności ze zmianą zwrotu'),
    ('b1110002-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000002', 'Zapisywanie rozwiązań w przedziałach'),
    -- Subtopic a1-3
    ('b1110003-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000003', 'Metoda podstawiania'),
    ('b1110003-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000003', 'Metoda przeciwnych współczynników'),
    ('b1110003-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000003', 'Układy nieoznaczone i sprzeczne'),

    -- Subtopic a2-1
    ('b2220001-0000-0000-0000-000000000001', 'a2222222-0000-0000-0000-000000000001', 'Obliczanie delty'),
    ('b2220001-0000-0000-0000-000000000002', 'a2222222-0000-0000-0000-000000000001', 'Wyznaczanie miejsc zerowych'),
    ('b2220001-0000-0000-0000-000000000003', 'a2222222-0000-0000-0000-000000000001', 'Liczba pierwiastków w zależności od delty'),
    -- Subtopic a2-2
    ('b2220002-0000-0000-0000-000000000001', 'a2222222-0000-0000-0000-000000000002', 'Wyznaczanie współrzędnej p'),
    ('b2220002-0000-0000-0000-000000000002', 'a2222222-0000-0000-0000-000000000002', 'Wyznaczanie współrzędnej q'),
    ('b2220002-0000-0000-0000-000000000003', 'a2222222-0000-0000-0000-000000000002', 'Wartość najmniejsza i największa w przedziale'),
    -- Subtopic a2-3
    ('b2220003-0000-0000-0000-000000000001', 'a2222222-0000-0000-0000-000000000003', 'Przekształcanie do postaci kanonicznej'),
    ('b2220003-0000-0000-0000-000000000002', 'a2222222-0000-0000-0000-000000000003', 'Przekształcanie do postaci iloczynowej'),
    ('b2220003-0000-0000-0000-000000000003', 'a2222222-0000-0000-0000-000000000003', 'Odczytywanie własności z postaci funkcji'),

    -- Subtopic a3-1
    ('b3330001-0000-0000-0000-000000000001', 'a3333333-0000-0000-0000-000000000001', 'Obliczanie wyrazów ciągu'),
    ('b3330001-0000-0000-0000-000000000002', 'a3333333-0000-0000-0000-000000000001', 'Badanie monotoniczności ciągu'),
    ('b3330001-0000-0000-0000-000000000003', 'a3333333-0000-0000-0000-000000000001', 'Sprawdzanie czy wyraz należy do ciągu'),
    -- Subtopic a3-2
    ('b3330002-0000-0000-0000-000000000001', 'a3333333-0000-0000-0000-000000000002', 'Wyznaczanie różnicy r'),
    ('b3330002-0000-0000-0000-000000000002', 'a3333333-0000-0000-0000-000000000002', 'Suma n początkowych wyrazów'),
    ('b3330002-0000-0000-0000-000000000003', 'a3333333-0000-0000-0000-000000000002', 'Własność trzech kolejnych wyrazów'),
    -- Subtopic a3-3
    ('b3330003-0000-0000-0000-000000000001', 'a3333333-0000-0000-0000-000000000003', 'Wyznaczanie ilorazu q'),
    ('b3330003-0000-0000-0000-000000000002', 'a3333333-0000-0000-0000-000000000003', 'Suma ciągu geometrycznego'),
    ('b3330003-0000-0000-0000-000000000003', 'a3333333-0000-0000-0000-000000000003', 'Własność iloczynowa wyrazów')
ON CONFLICT (id) DO NOTHING;

-- 6. Tasks (3 per Task Group = 81 Tasks)
-- Subtopic 1, Group 1
INSERT INTO public.tasks (id, task_group_id, task_type, content, difficulty_level, exemplary_solution, human_validated)
VALUES 
    ('c1110001-0000-0000-0000-000000000001', 'b1110001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Rozwiąż równanie: $$ 2x + 4 = 10 $$", "options": ["$$ x = 3 $$", "$$ x = 4 $$", "$$ x = 2 $$", "$$ x = 5 $$"], "correct_index": 0}', 'Easy', 'Odejmij 4 od obu stron: 2x = 6. Podziel przez 2: x = 3.', TRUE),
    ('c1110001-0000-0000-0000-000000000002', 'b1110001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Rozwiąż równanie: $$ 5x - 15 = 0 $$", "options": ["$$ x = 3 $$", "$$ x = -3 $$", "$$ x = 5 $$", "$$ x = 0 $$"], "correct_index": 0}', 'Easy', 'Przenieś 15 na prawą stronę: 5x = 15. Podziel przez 5: x = 3.', TRUE),
    ('c1110001-0000-0000-0000-000000000003', 'b1110001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Dla jakiego x zachodzi: $$ 3x + 1 = 2x + 7 $$?", "options": ["$$ x = 6 $$", "$$ x = 5 $$", "$$ x = 7 $$", "$$ x = 8 $$"], "correct_index": 0}', 'Medium', 'Odejmij 2x oraz 1 od obu stron: x = 6.', TRUE),

-- Subtopic 1, Group 2
    ('c1110002-0000-0000-0000-000000000001', 'b1110001-0000-0000-0000-000000000002', 'MCQ', '{"question": "Rozwiąż: $$ 2(x + 3) = 14 $$", "options": ["$$ x = 4 $$", "$$ x = 5 $$", "$$ x = 7 $$", "$$ x = 3 $$"], "correct_index": 0}', 'Easy', 'Wymnóż nawias: 2x + 6 = 14. 2x = 8 => x = 4.', TRUE),
    ('c1110002-0000-0000-0000-000000000002', 'b1110001-0000-0000-0000-000000000002', 'MCQ', '{"question": "Oblicz: $$ 3(2x - 1) = 15 $$", "options": ["$$ x = 3 $$", "$$ x = 2 $$", "$$ x = 4 $$", "$$ x = 5 $$"], "correct_index": 0}', 'Easy', '6x - 3 = 15 => 6x = 18 => x = 3.', TRUE),
    ('c1110002-0000-0000-0000-000000000003', 'b1110001-0000-0000-0000-000000000003', 'MCQ', '{"question": "Rozwiąż: $$ 4(x - 2) = 2(x + 4) $$", "options": ["$$ x = 8 $$", "$$ x = 6 $$", "$$ x = 4 $$", "$$ x = 2 $$"], "correct_index": 0}', 'Medium', '4x - 8 = 2x + 8 => 2x = 16 => x = 8.', TRUE),

-- Subtopic 1, Group 3
    ('c1110003-0000-0000-0000-000000000001', 'b1110001-0000-0000-0000-000000000003', 'MCQ', '{"question": "Suma dwóch liczb wynosi 20. Jedna jest o 4 większa od drugiej. Wyznacz mniejszą liczbę.", "options": ["$$ 8 $$", "$$ 12 $$", "$$ 6 $$", "$$ 10 $$"], "correct_index": 0}', 'Medium', 'Równanie: x + (x + 4) = 20 => 2x = 16 => x = 8.', TRUE),
    ('c1110003-0000-0000-0000-000000000002', 'b1110001-0000-0000-0000-000000000003', 'MCQ', '{"question": "Piotr ma 3 razy więcej znaczków niż Paweł. Razem mają 48 znaczków. Ile ma Paweł?", "options": ["$$ 12 $$", "$$ 16 $$", "$$ 36 $$", "$$ 24 $$"], "correct_index": 0}', 'Medium', '4x = 48 => x = 12.', TRUE),
    ('c1110003-0000-0000-0000-000000000003', 'b1110001-0000-0000-0000-000000000003', 'MCQ', '{"question": "Bok kwadratu zwiększono o 2 cm i jego obwód wynosi 24 cm. Ile wynosił pierwotny bok?", "options": ["$$ 4 \\text{ cm} $$", "$$ 6 \\text{ cm} $$", "$$ 5 \\text{ cm} $$", "$$ 3 \\text{ cm} $$"], "correct_index": 0}', 'Medium', '4(a + 2) = 24 => a + 2 = 6 => a = 4 cm.', TRUE),

-- Subtopic 2, Group 1
    ('c2220001-0000-0000-0000-000000000001', 'b2220001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Oblicz wyróżnik $$ \\Delta $$ dla $$ f(x) = x^2 - 5x + 6 $$", "options": ["$$ 1 $$", "$$ 25 $$", "$$ 49 $$", "$$ 0 $$"], "correct_index": 0}', 'Easy', 'Delta = (-5)^2 - 4*1*6 = 25 - 24 = 1.', TRUE),
    ('c2220001-0000-0000-0000-000000000002', 'b2220001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Oblicz $$ \\Delta $$ dla $$ f(x) = x^2 - 4x + 4 $$", "options": ["$$ 0 $$", "$$ 16 $$", "$$ 4 $$", "$$ -4 $$"], "correct_index": 0}', 'Easy', 'Delta = (-4)^2 - 4*1*4 = 16 - 16 = 0.', TRUE),
    ('c2220001-0000-0000-0000-000000000003', 'b2220001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Oblicz $$ \\Delta $$ dla $$ f(x) = 2x^2 + 3x + 5 $$", "options": ["$$ -31 $$", "$$ 31 $$", "$$ 49 $$", "$$ 9 $$"], "correct_index": 0}', 'Medium', 'Delta = 3^2 - 4*2*5 = 9 - 40 = -31.', TRUE),

-- Subtopic 2, Group 2
    ('c2220002-0000-0000-0000-000000000001', 'b2220002-0000-0000-0000-000000000001', 'MCQ', '{"question": "Wyznacz p wierzchołka dla $$ f(x) = x^2 - 6x + 8 $$", "options": ["$$ 3 $$", "$$ -3 $$", "$$ 6 $$", "$$ 8 $$"], "correct_index": 0}', 'Easy', 'p = -b/(2a) = -(-6)/2 = 3.', TRUE),
    ('c2220002-0000-0000-0000-000000000002', 'b2220002-0000-0000-0000-000000000002', 'MCQ', '{"question": "Wyznacz q wierzchołka dla $$ f(x) = x^2 - 2x + 3 $$", "options": ["$$ 2 $$", "$$ 3 $$", "$$ 1 $$", "$$ -1 $$"], "correct_index": 0}', 'Medium', 'p = 1. q = f(1) = 1 - 2 + 3 = 2.', TRUE),
    ('c2220002-0000-0000-0000-000000000003', 'b2220002-0000-0000-0000-000000000003', 'MCQ', '{"question": "Współrzędne wierzchołka $$ W $$ funkcji $$ f(x) = (x-2)^2 + 5 $$ to:", "options": ["$$ (2, 5) $$", "$$ (-2, 5) $$", "$$ (2, -5) $$", "$$ (5, 2) $$"], "correct_index": 0}', 'Easy', 'Postać kanoniczna f(x) = a(x-p)^2 + q => W=(2, 5).', TRUE),

-- Subtopic 3, Group 1
    ('c3330001-0000-0000-0000-000000000001', 'b3330001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Dany jest ciąg $$ a_n = 3n - 1 $$. Oblicz trzeci wyraz $$ a_3 $$.", "options": ["$$ 8 $$", "$$ 9 $$", "$$ 7 $$", "$$ 10 $$"], "correct_index": 0}', 'Easy', 'a_3 = 3*3 - 1 = 8.', TRUE),
    ('c3330001-0000-0000-0000-000000000002', 'b3330001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Dany jest ciąg $$ a_n = n^2 + 2 $$. Ile wynosi $$ a_4 $$?", "options": ["$$ 18 $$", "$$ 16 $$", "$$ 14 $$", "$$ 20 $$"], "correct_index": 0}', 'Easy', 'a_4 = 4^2 + 2 = 18.', TRUE),
    ('c3330001-0000-0000-0000-000000000003', 'b3330001-0000-0000-0000-000000000001', 'MCQ', '{"question": "Dany jest ciąg arytmetyczny o $$ a_1 = 2 $$ i $$ r = 4 $$. Oblicz $$ a_5 $$.", "options": ["$$ 18 $$", "$$ 20 $$", "$$ 16 $$", "$$ 22 $$"], "correct_index": 0}', 'Medium', 'a_5 = a_1 + 4r = 2 + 16 = 18.', TRUE),

-- Subtopic 3, Group 2
    ('c3330002-0000-0000-0000-000000000001', 'b3330002-0000-0000-0000-000000000001', 'MCQ', '{"question": "W ciągu arytmetycznym $$ a_1 = 3 $$ i $$ a_2 = 7 $$. Ile wynosi różnica r?", "options": ["$$ 4 $$", "$$ 3 $$", "$$ 10 $$", "$$ 2 $$"], "correct_index": 0}', 'Easy', 'r = a_2 - a_1 = 7 - 3 = 4.', TRUE),
    ('c3330002-0000-0000-0000-000000000002', 'b3330002-0000-0000-0000-000000000002', 'MCQ', '{"question": "Oblicz sumę 3 pierwszych wyrazów ciągu arytmetycznego: 2, 5, 8...", "options": ["$$ 15 $$", "$$ 12 $$", "$$ 18 $$", "$$ 20 $$"], "correct_index": 0}', 'Easy', 'S_3 = 2 + 5 + 8 = 15.', TRUE),
    ('c3330002-0000-0000-0000-000000000003', 'b3330002-0000-0000-0000-000000000003', 'MCQ', '{"question": "W ciągu geometrycznym $$ a_1 = 2 $$ i $$ q = 3 $$. Oblicz $$ a_3 $$.", "options": ["$$ 18 $$", "$$ 12 $$", "$$ 54 $$", "$$ 6 $$"], "correct_index": 0}', 'Medium', 'a_3 = a_1 * q^2 = 2 * 9 = 18.', TRUE)

ON CONFLICT (id) DO NOTHING;
