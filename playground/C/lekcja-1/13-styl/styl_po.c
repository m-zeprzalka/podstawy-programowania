#include <stdio.h>

int main(void)
{
    // Zapytaj o szerokość i narysuj rząd cegieł
    int szerokosc = 0;
    scanf("%d", &szerokosc);

    for (int i = 0; i < szerokosc; i++)
    {
        printf("#");
    }
    printf("\n");
}
