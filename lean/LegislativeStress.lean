import Lean

set_option warningAsError true

namespace Commonwealth.LegislativeStress

inductive Version where
  | v1 | v2
  deriving DecidableEq, Repr

def cliffGrant (threshold amount income : Nat) : Nat :=
  if income ≤ threshold then amount else 0

def phaseoutGrant (threshold amount income : Nat) : Nat :=
  if income ≤ threshold then amount else threshold + amount - income

def phaseoutNet (threshold amount income : Nat) : Nat :=
  income + phaseoutGrant threshold amount income

/-- General unit-slope phaseout, not restricted to the demo's finite domain. -/
theorem phaseout_monotone (t a x y : Nat) (h : x ≤ y) :
    phaseoutNet t a x ≤ phaseoutNet t a y := by
  unfold phaseoutNet phaseoutGrant
  split <;> split <;> omega

theorem phaseout_grant_bounded (t a x : Nat) :
    phaseoutGrant t a x ≤ a := by
  unfold phaseoutGrant
  split <;> omega

theorem phaseout_plateau (t a x : Nat) (h₁ : t ≤ x) (h₂ : x ≤ t + a) :
    phaseoutNet t a x = t + a := by
  unfold phaseoutNet phaseoutGrant
  split <;> omega

theorem phaseout_grant_eq_clamp (t a x : Nat) :
    phaseoutGrant t a x = min a (t + a - x) := by
  unfold phaseoutGrant
  rw [Nat.min_def]
  split <;> split <;> omega

def grant (v : Version) (x : Nat) : Nat :=
  match v with
  | .v1 => cliffGrant 1000 100 x
  | .v2 => phaseoutGrant 1000 100 x

def net (v : Version) (x : Nat) : Nat := x + grant v x

theorem v1_cliff_exact : net .v1 1000 = 1100 ∧ net .v1 1001 = 1001 := by
  decide

/-- The original rule has exactly one adjacent decrease, on all natural inputs. -/
theorem v1_unique_cliff (x : Nat) :
    net .v1 (x + 1) < net .v1 x ↔ x = 1000 := by
  unfold net grant cliffGrant
  split <;> split <;> omega

theorem v2_monotone (x y : Nat) (h : x ≤ y) :
    net .v2 x ≤ net .v2 y :=
  phaseout_monotone 1000 100 x y h

theorem v2_no_adjacent_cliff (x : Nat) :
    ¬ net .v2 (x + 1) < net .v2 x := by
  have h := v2_monotone x (x + 1) (by omega)
  omega

/-- Both years in the published demo are common Gregorian years.
    Other years are unsupported, rather than silently extrapolated. -/
def monthDays (m : Nat) : Nat :=
  if m = 2 then 28
  else if m = 4 ∨ m = 6 ∨ m = 9 ∨ m = 11 then 30
  else if 1 ≤ m ∧ m ≤ 12 then 31 else 0

def validDay (m d : Nat) : Prop := 1 ≤ d ∧ d ≤ monthDays m

instance (m d : Nat) : Decidable (validDay m d) := by
  unfold validDay
  infer_instance

def versionAt (y m d : Nat) : Option Version :=
  if validDay m d then
    if y = 2026 then some .v1
    else if y = 2027 then some .v2 else none
  else none

theorem version_2026 (m d : Nat) (h : validDay m d) :
    versionAt 2026 m d = some .v1 := by
  simp [versionAt, h]

theorem version_2027 (m d : Nat) (h : validDay m d) :
    versionAt 2027 m d = some .v2 := by
  simp [versionAt, h]

theorem version_invalid_day (y m d : Nat) (h : ¬ validDay m d) :
    versionAt y m d = none := by
  simp [versionAt, h]

theorem version_unsupported_year (y m d : Nat) (h₁ : y ≠ 2026) (h₂ : y ≠ 2027) :
    versionAt y m d = none := by
  simp [versionAt, h₁, h₂]

theorem amendment_boundary :
    versionAt 2026 12 31 = some .v1 ∧ versionAt 2027 1 1 = some .v2 := by
  decide

theorem invalid_february :
    versionAt 2027 2 29 = none ∧ versionAt 2026 2 29 = none := by
  decide

#print axioms phaseout_monotone
#print axioms phaseout_grant_bounded
#print axioms phaseout_plateau
#print axioms phaseout_grant_eq_clamp
#print axioms v1_cliff_exact
#print axioms v1_unique_cliff
#print axioms v2_monotone
#print axioms v2_no_adjacent_cliff
#print axioms version_2026
#print axioms version_2027
#print axioms version_invalid_day
#print axioms version_unsupported_year
#print axioms amendment_boundary
#print axioms invalid_february

def versionName : Version → String
  | .v1 => "v1"
  | .v2 => "v2"

def optionName : Option Version → String
  | none => "none"
  | some v => versionName v

end Commonwealth.LegislativeStress

open Commonwealth.LegislativeStress

/-- Export evaluation rows directly from the same definitions used in the proofs. -/
def main : IO Unit := do
  for v in [Version.v1, Version.v2] do
    for x in List.range 2001 do
      IO.println s!"CW|income|{versionName v}|{x}|{grant v x}|{net v x}"
  for y in [2025, 2026, 2027, 2028] do
    for m in List.range 14 do
      for d in List.range 33 do
        IO.println s!"CW|date|{y}|{m}|{d}|{optionName (versionAt y m d)}"
