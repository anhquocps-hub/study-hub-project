import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { academicApi } from '../api';

/** Trường, ngành, môn đang học của chính mình, để điền sẵn vào form onboarding. */
export function useMyAcademic() {
  return useAsyncData('academic:me', (signal) => academicApi.getMyAcademic(signal));
}
