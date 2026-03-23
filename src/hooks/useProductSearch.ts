import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export type SearchableProduct = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  source: "products" | "user_products";
};

export function useProductSearch(query: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await apiClient<any>("/api/app/products/get", {
          method: "POST",
          body: { search: query },
        });
        const records = Array.isArray(data) ? data : data.records ?? [];
        const combined: SearchableProduct[] = records.map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand ?? null,
          barcode: p.barcode ?? null,
          kcal_per_100g: Number(p.kcal_per_100g),
          protein_per_100g: Number(p.protein_per_100g),
          carbs_per_100g: Number(p.carbs_per_100g),
          fat_per_100g: Number(p.fat_per_100g),
          source: (p.source ?? "products") as "products" | "user_products",
        }));
        setResults(combined);
      } catch {
        setResults([]);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  return { results, isLoading };
}
