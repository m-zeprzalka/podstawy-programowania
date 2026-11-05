#include <stdio.h>

int main(void)
{
    // %.20f: wypisz 20 cyfr po kropce, żeby zobaczyć niedokładność
    printf("%.20f\n", 0.1);           // 0.10000000000000000555
    printf("%.20f\n", 1.0 / 3);       // 0.33333333333333331483

    // float ma tylko 32 bity, więc błąd jest dużo większy
    float f = 1.0f / 3;
    printf("%.20f\n", f);             // 0.33333334326744079590
}
