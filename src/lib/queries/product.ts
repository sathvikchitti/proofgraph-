"use client";
/** Hooks over the product datasets the backend does not serve yet (see lib/api/product-schemas.ts). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ProductData, type ProductKey, type VivaAnswerInput, type VivaStartInput } from "../api";
import { queryKeys } from "./keys";

export function useProduct<K extends ProductKey>(key: K) {
  return useQuery({ queryKey: queryKeys.product(key), queryFn: () => api.getProduct(key) });
}

/** Optimistic: the page shows the new value at once and rolls back if saving fails. */
export function useSaveProduct<K extends ProductKey>(key: K) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: ProductData[K]) => api.saveProduct(key, value),
    onMutate: async (value) => {
      await qc.cancelQueries({ queryKey: queryKeys.product(key) });
      const previous = qc.getQueryData<ProductData[K]>(queryKeys.product(key));
      qc.setQueryData(queryKeys.product(key), value);
      return { previous };
    },
    onError: (_e, _v, context) => {
      if (context?.previous !== undefined) qc.setQueryData(queryKeys.product(key), context.previous);
    },
    onSuccess: (value) => qc.setQueryData(queryKeys.product(key), value),
  });
}

export function useStartViva() {
  return useMutation({ mutationFn: (input: VivaStartInput) => api.startViva(input) });
}

export function useGradeViva() {
  return useMutation({ mutationFn: (input: VivaAnswerInput) => api.gradeViva(input) });
}
