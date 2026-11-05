#include <stdio.h>

int main(void)
{
    // Cztery bloki ze znakiem zapytania w jednym rzędzie
    for (int i = 0; i < 4; i++)
    {
        printf("?");    // bez \n: znaki stoją obok siebie
    }
    printf("\n");       // dopiero po pętli nowa linia
}
