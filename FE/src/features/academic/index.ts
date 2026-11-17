// Public API của feature academic (trường, ngành, môn)
export { AcademicOnboardingForm, AcademicOnboardingSkeleton } from './components/AcademicOnboardingForm';
export { useMajors } from './hooks/useMajors';
export { useMyAcademic } from './hooks/useMyAcademic';
export { useSubjects } from './hooks/useSubjects';
export { useUniversities } from './hooks/useUniversities';
export type { AcademicFormValues, Major, MyAcademic, Subject, University } from './model/academic-schemas';
