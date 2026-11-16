CC=qcc
CFLAGS=-Wall -Wextra -O2
all: ipc_server ipc_client
ipc_server: ipc_server.c
	$(CC) $(CFLAGS) -o $@ $<
ipc_client: ipc_client.c
	$(CC) $(CFLAGS) -o $@ $<
clean:
	rm -f ipc_server ipc_client
