#include <stdio.h>

void siatka(int kolumny, int wiersze);

int main(void)
{
    int kolumny = 0;
    int wiersze = 0;

    // Pytamy w main...
    printf("Podaj liczbę kolumn: ");
    scanf("%d", &kolumny);
    printf("Podaj liczbę wierszy: ");
    scanf("%d", &wiersze);

    // ...a funkcja tylko rysuje
    siatka(kolumny, wiersze);
}

// Rysuje siatkę z cegieł #. Pętlę w pętli omawia moduł „Mario”.
void siatka(int kolumny, int wiersze)
{
    for (int i = 0; i < wiersze; i++)
    {
        for (int j = 0; j < kolumny; j++)
        {
            printf("#");
        }
        printf("\n");
    }
}
