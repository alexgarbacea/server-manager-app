import { NotificationManager } from 'react-notifications';

export const createNotification = (type, msg) => {
    return () => {
        switch(type) {
            case 'info':
                NotificationManager.info(msg, 'Info')
            break
            default:
            break
        }
    }
}