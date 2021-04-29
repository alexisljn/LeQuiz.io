import React, {useState} from "react";
import Toastr from "toastr2";
import ApiUtil from "../../../util/ApiUtil";


const overlayStyle = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
    padding: 30,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
};

const modalStyle = {
    position: 'absolute',
    height: 500,
    width: 450,
    backgroundColor: '#1e8eb5',
    zIndex: 2,
    border: '4px white solid',
    borderRadius: 10,
    padding: 30,
}

const FeedbackModal = ({closeModal}) => {

    const toastr = new Toastr()

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const sendFeedback = async () => {
        try {
            const feedback = {}

            if (message === '')
                throw new Error('message vide');

            if (subject) feedback['subject'] = subject;

            feedback['message'] = message;
            const response = await ApiUtil.sendJsonToAPI('/users/feedback', feedback);

            if (!response.ok)
                throw new Error('Impossible d\'envoyer votre message. Réessayez ultérieurement');

            toastr.success('Votre message a été envoyé. Merci de nous aider à améliorer leQuiz.io');

        } catch (error) {
            toastr.error(error.message);
        }
    }

    const handleKeyPress = async (charCode) => {
        if (charCode === 13) await sendFeedback()
    }

    return (
        <div onClick={() => closeModal()}
             style={overlayStyle}
        >
            <div style={modalStyle}
                 onClick={(e) => {e.stopPropagation()}}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <p style={{fontSize: '1.4em', marginBottom: 20}}>Feedback</p>
                    <button type="button" onClick={() => closeModal()}>X</button>
                </div>

                <div style={{marginBottom: 20}}>
                    <input type="text"
                           style={{width:'80%'}}
                           value={subject}
                           placeholder="sujet"
                           autoFocus={true}
                           onChange={(e) => setSubject(e.target.value)}
                           onKeyPress={(e) => handleKeyPress(e.charCode)}
                    />
                </div>
                <div style={{marginBottom: 20}}>
                    <textarea value={message}
                              style={{width:'80%'}}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="message"
                              cols="30"
                              rows="10"/>
                </div>
                <button type="submit" onClick={() => {sendFeedback()}}>Envoyer</button>
            </div>
        </div>

    )
}

export default FeedbackModal;