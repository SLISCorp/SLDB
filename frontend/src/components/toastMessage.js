import { toast } from "react-toastify";
import swal from "sweetalert";
const toastId = "my-toast";

const showToast = (message, id = toastId) => {
  toast.configure();
  toast.dismiss();
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    toastId: id,
  });
};

const showDangerToast = (message, id = toastId) => {
  toast.configure();
  toast.dismiss();
  toast.error(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    toastId: id,
  });
};

const showInfoToast = (message, id = toastId) => {
  toast.configure();
  toast.dismiss();
  toast.info(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    toastId: id,
  });
};

const showAlert = (message, label = "error") => {
  swal(label, message, label);
};

const confirmAlert = (message, title, type, dangerMode, successMessage) => {
  return swal({
    title: title,
    text: message,
    icon: type,
    dangerMode: dangerMode,
  });
};

const SwalConfig = (message = "You want Change Status") => {
  return {
    title: 'Are you sure?',
    text: message,   
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }
}

export { showToast, showDangerToast, showInfoToast, showAlert, confirmAlert, SwalConfig };
