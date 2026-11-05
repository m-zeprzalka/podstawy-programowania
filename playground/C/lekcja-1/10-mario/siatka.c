#include <stdio.h>

int main(void)
{
    for (int i = 0; i < 3; i++)          // dla każdego rzędu
    {
        for (int j = 0; j < 3; j++)      // dla każdej cegły w rzędzie
        {
            printf("#");
        }
        printf("\n");                    // koniec rzędu
    }
}
