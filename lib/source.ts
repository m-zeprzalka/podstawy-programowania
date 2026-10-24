import { defineDocs } from "fumadocs-mdx/macro"
import { loader } from "fumadocs-core/source"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"

/**
 * Treść kursu żyje w `content/kurs`. Każda lekcja to folder:
 * `index.mdx` opisuje lekcję, a pozostałe pliki .mdx to jej moduły
 * (kolejność ustala `meta.json` w folderze lekcji).
 */
export const kurs = defineDocs({
  dir: "content/kurs",
  docs: {
    schema: pageSchema.extend({
      /** Krótka nazwa do nawigacji (domyślnie `title`). */
      nav: z.string().optional(),
      /** Szacowany czas nauki w minutach. */
      czas: z.number().optional(),
      /** Numer lekcji, tylko w `index.mdx` lekcji. */
      numer: z.number().optional(),
      /** Lekcja dostępna albo zapowiedziana. */
      status: z.enum(["dostepna", "wkrotce"]).default("dostepna"),
      /** Moduł przeznaczony głównie dla prowadzącego. */
      dlaProwadzacego: z.boolean().default(false),
      /** Lista źródeł lekcji, numerowana od 1 (do przypisów `<Zrodlo n={…} />`). */
      zrodla: z
        .array(z.object({ tytul: z.string(), url: z.string() }))
        .optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
})

export const source = loader({
  baseUrl: "/kurs",
  source: kurs.toFumadocsSource(),
})

export type KursPage = NonNullable<ReturnType<typeof source.getPage>>
