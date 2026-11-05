#include <stdio.h>

void rzad(int szerokosc);

int main(void)
{
    // i od 1 do 4 włącznie, a rząd ma tyle cegieł, ile wynosi i
    for (int i = 1; i <= 4; i++)
    {
        rzad(i);
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
