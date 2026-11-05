#include <stdio.h>

int main(void)
{
    int x = 7;
    int y = 2;

    printf("%d\n", x / y);               // 3: dzielenie całkowite

    // (double) x: potraktuj x jako liczbę z ułamkiem
    printf("%f\n", (double) x / y);      // 3.500000
    printf("%.2f\n", (double) x / y);    // 3.50

    // Rzutowanie w złym miejscu: najpierw 7 / 2 = 3, potem 3.0
    printf("%f\n", (double) (x / y));    // 3.000000
}
