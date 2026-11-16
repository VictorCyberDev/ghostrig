/* Genuine QNX IPC client source only: not yet executed on QNX. */
#include <sys/neutrino.h>
#include <sys/dispatch.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#define GHOSTR_IPC_REQ 0x4701
struct request { unsigned short type; unsigned short reserved; unsigned int generation; };
struct response { unsigned int generation; int status; };
int main(void){
 int fd=name_open("ghostr_r0_ipc",0);
 if(fd<0){perror("name_open");return EXIT_FAILURE;}
 struct request req={GHOSTR_IPC_REQ,0,42};
 struct response resp={0};
 int ret=MsgSend(fd,&req,sizeof(req),&resp,sizeof(resp));
 if(ret<0){perror("MsgSend");name_close(fd);return EXIT_FAILURE;}
 printf("GHOSTR_QNX_IPC_CLIENT_OK generation=%u status=%d\n",resp.generation,resp.status);
 name_close(fd);
 return resp.generation==42&&resp.status==0?EXIT_SUCCESS:EXIT_FAILURE;
}
