CC=qcc
CFLAGS=-Wall -Wextra -O2
all: range_manager range_client
range_manager: range_manager.c
	$(CC) $(CFLAGS) -o $@ $<
range_client: range_client.c
	$(CC) $(CFLAGS) -o $@ $<
clean:
	rm -f range_manager range_client
