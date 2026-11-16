/* Genuine QNX IPC source only: not yet executed on QNX. */
#include <sys/neutrino.h>
#include <sys/dispatch.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#define GHOSTR_IPC_REQ 0x4701
struct request { unsigned short type; unsigned short reserved; unsigned int generation; };
struct response { unsigned int generation; int status; };
int main(void) {
 name_attach_t *attach=name_attach(NULL,"ghostr_r0_ipc",0);
 if(!attach){perror("name_attach");return EXIT_FAILURE;}
 printf("GHOSTR_QNX_IPC_SERVER_READY pid=%ld\n",(long)getpid());fflush(stdout);
 for(;;) {
  struct request req={0};struct response reply={0};
  int rcvid=MsgReceive(attach->chid,&req,sizeof(req),NULL);
  if(rcvid<0){perror("MsgReceive");break;}
  if(rcvid==0)continue;
  if(req.type!=GHOSTR_IPC_REQ){MsgError(rcvid,ENOSYS);continue;}
  reply.generation=req.generation;reply.status=0;
  if(MsgReply(rcvid,EOK,&reply,sizeof(reply))<0){perror("MsgReply");break;}
  printf("GHOSTR_QNX_IPC_HANDLED generation=%u\n",req.generation);fflush(stdout);
 }
 name_detach(attach,0);return EXIT_FAILURE;
}
