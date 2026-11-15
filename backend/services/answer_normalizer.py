r"""
Normalizator odpowiedzi dla zadań otwartych (OPEN).
Porównuje odpowiedź ucznia z poprawną odpowiedzią z uwzględnieniem:
- formatowania LaTeX ($, $$, \frac, \sqrt, itd.)
- polskiego separatora dziesiętnego (przecinek -> kropka)
- równoważności algebraicznej (sympy)
- tolerancji numerycznej
"""

import re
import warnings
from sympy import simplify, N, sympify, Rational

# Wyłączenie ostrzeżeń z opcjonalnego parsera latex w sympy
warnings.filterwarnings("ignore", category=UserWarning, module="sympy.parsing.latex")

# Opcjonalny import parse_latex (wymaga antlr4)
try:
    from sympy.parsing.latex import parse_latex
    HAS_PARSE_LATEX = True
except Exception:
    HAS_PARSE_LATEX = False


def normalize_answer(raw: str) -> str:
    """
    Czyści surowy tekst odpowiedzi z formatowania LaTeX i normalizuje zapis.
    """
    if not raw:
        return ""

    s = str(raw).strip()

    # Usunięcie owijki $$ i $
    s = re.sub(r'^\$\$?|\$\$?$', '', s).strip()
    s = re.sub(r'^\$|\$$', '', s).strip()

    # Usunięcie \left, \right, \text{}, \mathrm{} itp.
    s = re.sub(r'\\(?:left|right)[.()\[\]|]?', '', s)
    s = re.sub(r'\\(?:text|mathrm|mathit)\{([^}]*)\}', r'\1', s)

    # Zamiana polskiego przecinka dziesiętnego na kropkę między cyframi (np. "0,5" -> "0.5")
    s = re.sub(r'(\d),(\d)', r'\1.\2', s)

    # Usunięcie zbędnych spacji
    s = re.sub(r'\s+', ' ', s).strip()

    return s


def _latex_to_python_expr(s: str) -> str:
    """
    Konwertuje popularne konstrukcje LaTeX na zapis zrozumiały dla sympify.
    Działa jako szybki i niezawodny fallback bez konieczności używania antlr4.
    """
    expr = s

    # \frac{a}{b} lub \dfrac{a}{b} -> ((a)/(b))
    # obsługa zagnieżdżonych do 2 poziomów
    for _ in range(3):
        expr = re.sub(r'\\d?frac\{([^{}]+)\}\{([^{}]+)\}', r'((\1)/(\2))', expr)

    # \sqrt{a} -> sqrt(a)
    for _ in range(3):
        expr = re.sub(r'\\sqrt\{([^{}]+)\}', r'sqrt(\1)', expr)

    # x^{y} -> x**(y)
    expr = re.sub(r'\^\{([^{}]+)\}', r'**(\1)', expr)
    expr = re.sub(r'\^([0-9a-zA-Z])', r'**\1', expr)

    # \cdot -> *
    expr = expr.replace(r'\cdot', '*')
    expr = expr.replace(r'\times', '*')

    return expr


def _try_parse_as_number(s: str) -> float | None:
    """Próbuje sparsować string jako liczbę za pomocą float, Rational lub sympify."""
    # 1. Prosty float
    try:
        return float(s)
    except (ValueError, TypeError):
        pass

    # 2. Ułamek prosty a/b
    match = re.fullmatch(r'(-?\d+(?:\.\d+)?)\s*/\s*(-?\d+(?:\.\d+)?)', s)
    if match:
        try:
            return float(Rational(match.group(1), match.group(2)))
        except Exception:
            pass

    # 3. Ewaluacja za pomocą sympy.sympify z konwersją LaTeX
    try:
        py_expr = _latex_to_python_expr(s)
        sym_obj = sympify(py_expr)
        return float(N(sym_obj))
    except Exception:
        pass

    return None


def answers_are_equal(user_raw: str, correct_raw: str, tolerance: float = 0) -> bool:
    """
    Porównuje odpowiedź ucznia z poprawną odpowiedzią.

    Strategia (w kolejności priorytetu):
    1. Porównanie symboliczne przez parse_latex (jeśli antlr4 jest dostępny).
    2. Porównanie symboliczne po konwersji do wyrażeń sympy.
    3. Porównanie numeryczne (float / sympify) z uwzględnieniem tolerancji.
    4. Fallback: porównanie znormalizowanych stringów (case-insensitive).
    """
    if not user_raw or not correct_raw:
        return False

    user_clean = normalize_answer(user_raw)
    correct_clean = normalize_answer(correct_raw)

    if not user_clean or not correct_clean:
        return False

    # --- Próba 1: Porównanie symboliczne z parse_latex (jeśli antlr4 działa) ---
    if HAS_PARSE_LATEX:
        try:
            user_expr = parse_latex(user_clean)
            correct_expr = parse_latex(correct_clean)
            diff = simplify(user_expr - correct_expr)
            if diff == 0:
                return True
            diff_val = abs(float(N(diff)))
            if diff_val <= tolerance:
                return True
        except Exception:
            pass

    # --- Próba 2: Porównanie symboliczne przez sympify (_latex_to_python_expr) ---
    try:
        user_sym = sympify(_latex_to_python_expr(user_clean))
        correct_sym = sympify(_latex_to_python_expr(correct_clean))
        diff = simplify(user_sym - correct_sym)
        if diff == 0:
            return True
        diff_val = abs(float(N(diff)))
        if diff_val <= tolerance:
            return True
    except Exception:
        pass

    # --- Próba 3: Porównanie jako wartości numeryczne ---
    user_num = _try_parse_as_number(user_clean)
    correct_num = _try_parse_as_number(correct_clean)

    if user_num is not None and correct_num is not None:
        if abs(user_num - correct_num) <= tolerance:
            return True

    # --- Próba 4: Fallback — porównanie stringowe (case-insensitive) ---
    return user_clean.lower() == correct_clean.lower()
