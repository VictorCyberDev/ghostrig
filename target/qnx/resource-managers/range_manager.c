/* GhostRig R1: read-only synthetic-range resource manager.
 * This provides a real native pathname and read handler when built on QNX.
 * Static values are TEST FIXTURES, not host-derived sensor observations.
 * No physical loop or native execution is claimed by this source file. */
#include <sys/iofunc.h>
#include <sys/dispatch.h>
#include <sys/stat.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>

static const char sample[] = "GHRS1 generation=1 range_mm=1800 sample_tick=0\n";
static iofunc_attr_t dev_attr;

static int read_range(resmgr_context_t *ctp, io_read_t *msg, RESMGR_OCB_T *ocb) {
  int status = iofunc_read_verify(ctp, msg, ocb, NULL);
  if (status != EOK) return status;
  if ((msg->i.xtype & _IO_XTYPE_MASK) != _IO_XTYPE_NONE) return ENOSYS;
  const size_t total = sizeof(sample) - 1;
  size_t remain = ocb->offset < (off_t)total ? total - (size_t)ocb->offset : 0;
  size_t n = msg->i.nbytes < remain ? msg->i.nbytes : remain;
  _IO_SET_READ_NBYTES(ctp, n);
  if (n == 0) return _RESMGR_NPARTS(0);
  SETIOV(ctp->iov, sample + ocb->offset, n);
  ocb->offset += (off_t)n;
  if (ocb->offset == (off_t)total) ocb->attr->flags |= IOFUNC_ATTR_ATIME;
  return _RESMGR_NPARTS(1);
}

int main(void) {
  if (mkdir("/dev/ghostr", 0755) == -1 && errno != EEXIST) {
    perror("mkdir /dev/ghostr"); return EXIT_FAILURE;
  }
  dispatch_t *dpp = dispatch_create();
  if (!dpp) { perror("dispatch_create"); return EXIT_FAILURE; }
  resmgr_attr_t options = {0};
  options.nparts_max = 1;
  options.msg_max_size = 2048;
  resmgr_connect_funcs_t connect_funcs;
  resmgr_io_funcs_t io_funcs;
  iofunc_func_init(_RESMGR_CONNECT_NFUNCS, &connect_funcs, _RESMGR_IO_NFUNCS, &io_funcs);
  io_funcs.read = read_range;
  /* Owner-only: this demo device must not become a public privileged interface. */
  iofunc_attr_init(&dev_attr, S_IFNAM | 0600, 0, 0);
  if (resmgr_attach(dpp, &options, "/dev/ghostr/range", _FTYPE_ANY, 0,
                    &connect_funcs, &io_funcs, &dev_attr) == -1) {
    perror("resmgr_attach"); dispatch_destroy(dpp); return EXIT_FAILURE;
  }
  dispatch_context_t *ctp = dispatch_context_alloc(dpp);
  if (!ctp) { perror("dispatch_context_alloc"); return EXIT_FAILURE; }
  puts("GHSTR_RANGE_MANAGER_READY fixture=1 path=/dev/ghostr/range");
  fflush(stdout);
  for (;;) {
    ctp = dispatch_block(ctp);
    if (!ctp) { perror("dispatch_block"); return EXIT_FAILURE; }
    dispatch_handler(ctp);
  }
}
