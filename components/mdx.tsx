import type { MDXComponents } from "mdx/types"

import {
  Cel,
  DlaProwadzacego,
  Pojecia,
  Ramka,
  Uwaga,
  Wskazowka,
} from "@/components/kurs/bloki"
import { A, H2, H3, H4, Pre, Table } from "@/components/kurs/mdx-elementy"
import { Pytanie, Quiz } from "@/components/kurs/quiz"
import { Dociekliwi, NaZajeciach } from "@/components/kurs/rozwijane"
import { ListaZrodel, Zrodlo } from "@/components/kurs/zrodla"
import { interaktywne } from "@/components/interaktywne"

/**
 * Komponenty dostępne w plikach .mdx bez importu.
 * Nowy przykład interaktywny dopisz w `components/interaktywne/index.ts`.
 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    h2: H2,
    h3: H3,
    h4: H4,
    a: A,
    pre: Pre,
    table: Table,
    Cel,
    Pojecia,
    Ramka,
    Uwaga,
    Wskazowka,
    DlaProwadzacego,
    NaZajeciach,
    Dociekliwi,
    Quiz,
    Pytanie,
    Zrodlo,
    ListaZrodel,
    ...interaktywne,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents
