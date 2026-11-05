#include <stdio.h>

int main(void)
{
    // char: zmienna na jeden znak
    char odpowiedz;

    // Pytanie to napis, więc stoi w cudzysłowie
    printf("Zgadzasz się? (t/n) ");
    // Spacja przed %c pomija Enter i spacje, które zostały w kolejce
    scanf(" %c", &odpowiedz);

    // Pojedyncze znaki porównujemy w apostrofach: 't', a nie "t"
    if (odpowiedz == 't' || odpowiedz == 'T')
    {
        printf("Zgoda.\n");
    }
    else if (odpowiedz == 'n' || odpowiedz == 'N')
    {
        printf("Brak zgody.\n");
    }
    else
    {
        printf("Nie rozumiem.\n");
    }
}
