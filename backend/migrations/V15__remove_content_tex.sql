-- Migration V15: Remove content_tex from topics and subtopics if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'topics' 
          AND column_name = 'content_tex'
    ) THEN
        ALTER TABLE public.topics DROP COLUMN content_tex;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subtopics' 
          AND column_name = 'content_tex'
    ) THEN
        ALTER TABLE public.subtopics DROP COLUMN content_tex;
    END IF;
END $$;

-- Update get_prior_knowledge to ensure content_tex is not referenced
CREATE OR REPLACE FUNCTION get_prior_knowledge(p_subtopic_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_topic_id UUID;
    v_sort_order INTEGER;
    v_known_topics JSON;
    v_known_subtopics JSON;
    v_unknown_topics JSON;
BEGIN
    SELECT topic_id, sort_order INTO v_topic_id, v_sort_order
    FROM public.subtopics
    WHERE id = p_subtopic_id;

    WITH RECURSIVE ancestors AS (
        SELECT parent_id
        FROM public.topic_edges
        WHERE child_id = v_topic_id
        UNION
        SELECT e.parent_id
        FROM public.topic_edges e
        INNER JOIN ancestors a ON a.parent_id = e.child_id
    )
    SELECT COALESCE(json_agg(t.name), '[]'::json) INTO v_known_topics
    FROM public.topics t
    JOIN ancestors a ON t.id = a.parent_id;

    WITH RECURSIVE ancestors AS (
        SELECT parent_id
        FROM public.topic_edges
        WHERE child_id = v_topic_id
        UNION
        SELECT e.parent_id
        FROM public.topic_edges e
        INNER JOIN ancestors a ON a.parent_id = e.child_id
    )
    SELECT COALESCE(json_agg(t.name), '[]'::json) INTO v_unknown_topics
    FROM public.topics t
    WHERE t.id != v_topic_id AND t.id NOT IN (SELECT parent_id FROM ancestors);

    SELECT COALESCE(json_agg(
        json_build_object(
            'name', name
        )
    ), '[]'::json) INTO v_known_subtopics
    FROM public.subtopics
    WHERE topic_id = v_topic_id AND sort_order < v_sort_order;

    RETURN json_build_object(
        'known_topics_names', v_known_topics,
        'known_subtopics', v_known_subtopics,
        'unknown_topics_names', v_unknown_topics
    );
END;
$$;
