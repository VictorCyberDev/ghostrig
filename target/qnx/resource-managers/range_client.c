/* Native QNX client; fixture reader, not a completed host bridge. */
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
int main(void) {
  int fd = open("/dev/ghostr/range", O_RDONLY);
  if (fd < 0) { perror("open"); return EXIT_FAILURE; }
  char buf[128] = {0};
  ssize_t n = read(fd, buf, sizeof(buf)-1);
  if (n < 0) { perror("read"); close(fd); return EXIT_FAILURE; }
  close(fd);
  if (n == 0 || strncmp(buf,"GHRS1 generation=",17) != 0) {
    fprintf(stderr,"invalid or missing range fixture\n"); return EXIT_FAILURE;
  }
  printf("GHSTR_RANGE_CLIENT_READ %s",buf);
  return EXIT_SUCCESS;
}
