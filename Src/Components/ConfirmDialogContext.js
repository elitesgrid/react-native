import React, {createContext, useContext, useState, useCallback} from 'react';
import ConfirmDialog from './ConfirmDialog';

const ConfirmDialogContext = createContext();

export const ConfirmDialogProvider = ({children}) => {
  const [dialogData, setDialogData] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmDialog = useCallback(
    ({
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'OK',
      cancelText = 'Cancel',
      onConfirm = () => {},
      onCancel = () => {},
    }) => {
      setDialogData({
        visible: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          onConfirm();
          setDialogData(prev => ({...prev, visible: false}));
        },
        onCancel: () => {
          onCancel();
          setDialogData(prev => ({...prev, visible: false}));
        },
      });
    },
    [],
  );

  const hideConfirmDialog = () => {
    setDialogData(prev => ({...prev, visible: false}));
  };

  return (
    <ConfirmDialogContext.Provider value={{showConfirmDialog, hideConfirmDialog}}>
      {children}
      <ConfirmDialog {...dialogData} />
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => useContext(ConfirmDialogContext);
