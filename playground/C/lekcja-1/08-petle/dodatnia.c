#include <stdio.h>

int main(void)
{
    // Wartość 0 na start, żeby w n nie było przypadkowych resztek
    int n = 0;
    do
    {
        printf("Podaj liczbę dodatnią: ");
        scanf("%d", &n);    // &n: adres, pod który scanf zapisze liczbę
    }
    while (n < 1);          // pytaj jeszcze raz, dopóki n jest mniejsze od 1

    printf("Dziękuję, %d.\n", n);
}
