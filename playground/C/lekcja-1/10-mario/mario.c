#include <stdio.h>

// Prototyp: zapowiedź funkcji, która jest niżej
void rzad(int szerokosc);

int main(void)
{
    int n = 0;

    // Pytaj o rozmiar, dopóki nie będzie dodatni
    do
    {
        printf("Rozmiar: ");
        scanf("%d", &n);
    }
    while (n < 1);

    // n razy narysuj rząd o szerokości n
    for (int i = 0; i < n; i++)
    {
        rzad(n);
    }
}

// Rysuje jeden rząd cegieł i przechodzi do nowej linii
void rzad(int szerokosc)
{
    for (int j = 0; j < szerokosc; j++)
    {
        printf("#");
    }
    printf("\n");
}
