/**
 * Dane kursu widoczne w nagłówku, stopce i metadanych.
 * Uzupełnij `autor` i `uczelnia` (wymaga tego licencja CC BY-NC-SA 4.0).
 */
export const site = {
  nazwa: "Podstawy programowania",
  znak: "~/podstawy programowania",
  opis: "Interaktywny kurs podstaw informatyki i programowania: od zer i jedynek, przez algorytmy, do pierwszego programu.",
  autor: "M. Zeprzałka",
  uczelnia: "[uczelnia]",
  rok: 2026,
  licencja: {
    nazwa: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pl",
  },
  /** Atrybucja wymagana przez CC BY-NC-SA 4.0 (jedyna wzmianka, w stopce). */
  atrybucja: {
    nazwa: "CS50x",
    autor: "David J. Malan, Harvard University",
    url: "https://cs50.harvard.edu/x/",
  },
} as const
