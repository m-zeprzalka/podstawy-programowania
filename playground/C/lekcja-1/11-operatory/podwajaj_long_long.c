#include <stdio.h>

int main(void)
{
    // long long ma 8 bajtów, więc mieści dużo większe liczby niż int
    long long n = 1;
    for (int i = 0; i < 33; i++)
    {
        printf("2^%d = %lld\n", i, n);    // %lld: wstawka na long long
        n = n * 2;
    }
}
