#include <stdio.h>

int main(void)
{
    int n = 1;
    for (int i = 0; i < 33; i++)
    {
        // 2^ to zwykły tekst, a w miejsca %d trafią i oraz n
        printf("2^%d = %d\n", i, n);
        n = n * 2;    // podwój n
    }
}
