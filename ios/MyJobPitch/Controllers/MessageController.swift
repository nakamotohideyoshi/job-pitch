//
//  MessageController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import JSQMessagesViewController
import Nuke

class MessageController: JSQMessagesViewController {
    
    public var application: Application!
    
    var messages = [(JSQMessage, Message)]()
    
    var senderBubbleImage: JSQMessagesBubbleImage!
    var senderAvatar: JSQMessagesAvatarImage!
    
    var receiverDisplayName: String!
    var receiverBubbleImage: JSQMessagesBubbleImage!
    var receiverAvatar: JSQMessagesAvatarImage!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        inputToolbar.contentView.leftBarButtonItem = nil
        
        collectionView.collectionViewLayout.messageBubbleFont = UIFont.systemFont(ofSize: 16)
        
        senderId = "sender"
        
        let bubbleFactory = JSQMessagesBubbleImageFactory()
        receiverBubbleImage = bubbleFactory?.incomingMessagesBubbleImage(with: AppData.yellowColor)
        senderBubbleImage = bubbleFactory?.outgoingMessagesBubbleImage(with: AppData.greenColor)
        
        if AppData.user.isJobSeeker() {
            
            if application.status == ApplicationStatus.APPLICATION_CREATED_ID {
                
                inputToolbar.isUserInteractionEnabled = false
                inputToolbar.contentView.textView.placeHolder = "Input is disabled"
                PopupController.showGray("You cannot send messages until your application is accepted", ok: "OK")
            }
            
        } else {
            
            if application.status == ApplicationStatus.APPLICATION_CREATED_ID {
                
                inputToolbar.isUserInteractionEnabled = false
                inputToolbar.contentView.textView.placeHolder = "Input is disabled"
                PopupController.showGreen("You cannot send messages until you have connected", ok: "Connect (1 credit)", okCallback: {
                    
                    let update = ApplicationStatusUpdate()
                    update.id = self.application.id
                    update.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
                    
                    API.shared().updateApplicationStatus(update: update, success: { (data) in
                        AppData.getApplication(self.application.id, success: { (application) in
                            self.application = application
                            self.updateData()
                        }, failure: nil)
                    }) { (message, errors) in
                        if errors?["NO_TOKENS"] != nil {
                            PopupController.showGray("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", ok: "Ok")
                        } else {
                            PopupController.showGray("There was an error connecting the jobseeker.", ok: "Ok")
                        }
                    }
                    
                }, cancel: "Cancel", cancelCallback: nil)
                
            } else if application.status == ApplicationStatus.APPLICATION_DELETED_ID {
                
                inputToolbar.isUserInteractionEnabled = false
                inputToolbar.contentView.textView.placeHolder = "Input is disabled"
                PopupController.showGray("This application has been deleted.", ok: "OK")
            }
        }
        
//        self.collectionView.register(UINib(nibName: "MessagesCollectionViewCellIncoming", bundle: nil), forCellWithReuseIdentifier: "incomingCell")
//        self.collectionView.register(UINib(nibName: "MessagesCollectionViewCellOutgoing", bundle: nil), forCellWithReuseIdentifier: "outgoingCell")
        
        updateData()
    }
    
    func updateData() {
        
        let job = application.job!
        let jobSeeker = application.jobSeeker!
        let jobLogo = job.getImage()?.thumbnail
        let jobSeekerPhoto = jobSeeker.profileThumb
        
        inputToolbar.isUserInteractionEnabled = true
        inputToolbar.contentView.textView.placeHolder = "New Message"
        
        if AppData.user.isJobSeeker() {
            
            senderDisplayName = jobSeeker.getFullName()
            receiverDisplayName = job.locationData.businessData.name
            
            setAavatar(sender: true, path: jobSeekerPhoto, defaultAvatar: "avatar")
            setAavatar(sender: false, path: jobLogo, defaultAvatar: "default-logo")
            
            if application.status == ApplicationStatus.APPLICATION_CREATED_ID {
                
                inputToolbar.isUserInteractionEnabled = false
                inputToolbar.contentView.textView.placeHolder = "Input is disabled"
            }
            
        } else {
            
            senderDisplayName = job.locationData.businessData.name
            receiverDisplayName = jobSeeker.getFullName()
            
            setAavatar(sender: true, path: jobLogo, defaultAvatar: "default-logo")
            setAavatar(sender: false, path: jobSeekerPhoto, defaultAvatar: "avatar")
            
            if application.status == ApplicationStatus.APPLICATION_CREATED_ID {
                
                inputToolbar.isUserInteractionEnabled = false
                inputToolbar.contentView.textView.placeHolder = "Input is disabled"
                
            } else if application.status == ApplicationStatus.APPLICATION_DELETED_ID {
                
                inputToolbar.isUserInteractionEnabled = false
                inputToolbar.contentView.textView.placeHolder = "This application has been deleted."
            }
        }
        
        let oldMessageCount = messages.count
        messages.removeAll()
        
        let interview = application.getInterview()
        
        for message in application.messages as! [Message] {
            
            var content = message.content
            if interview != nil {
                if (interview?.messages.lastObject as! Message).id == message.id {
//                    content = "Interview\n" + content! + "\nInterview: " + AppHelper.dateToLongString((interview?.at)!)
                    content = "Interview\n" + content! + "\n"
                }
            }
            
            if message.fromRole == AppData.userRole {
                let jsqMessage = JSQMessage(senderId: senderId,
                                            senderDisplayName: senderDisplayName,
                                            date: message.created,
                                            text: content)
                messages.append((jsqMessage!, message))
            } else {
                let jsqMessage = JSQMessage(senderId: "receiver",
                                            senderDisplayName: receiverDisplayName,
                                            date: message.created,
                                            text: content)
                messages.append((jsqMessage!, message))
            }
        }
        
        collectionView.reloadData()
        
        if messages.count != oldMessageCount {
            scrollToBottom(animated: true)
        }
    }

    func setAavatar(sender: Bool, path: String!, defaultAvatar: String!) {
        
        if path != nil {
            Nuke.loadImage(with: (URL(string: path))!, into: UIView()) { (result, _) in
                var avatarImage: JSQMessagesAvatarImage!
                if result.error == nil {
                    avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: result.value, diameter: 15)
                } else {
                    avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(named: defaultAvatar), diameter: 15)
                }
                
                if sender {
                    self.senderAvatar = avatarImage
                } else {
                    self.receiverAvatar = avatarImage
                }
                
                self.collectionView.reloadData()
            }
        } else {
            let avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(named: defaultAvatar), diameter: 15)

            if sender {
                self.senderAvatar = avatarImage
            } else {
                self.receiverAvatar = avatarImage
            }
        }
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, messageBubbleImageDataForItemAt indexPath: IndexPath!) -> JSQMessageBubbleImageDataSource! {
        let (jsqMessage, _) = messages[indexPath.row]
        return jsqMessage.senderId == senderId ? senderBubbleImage : receiverBubbleImage
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, avatarImageDataForItemAt indexPath: IndexPath!) -> JSQMessageAvatarImageDataSource! {
        let (jsqMessage, _) = messages[indexPath.row]
        return jsqMessage.senderId == senderId ? senderAvatar : receiverAvatar
    }

    override func collectionView(_ collectionView: JSQMessagesCollectionView!, layout collectionViewLayout: JSQMessagesCollectionViewFlowLayout!, heightForCellBottomLabelAt indexPath: IndexPath!) -> CGFloat {
        return kJSQMessagesCollectionViewCellLabelHeightDefault
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, attributedTextForCellBottomLabelAt indexPath: IndexPath!) -> NSAttributedString! {
        let (jsqMessage, _) = messages[indexPath.row]
        let dateStr = AppHelper.dateToShortString(jsqMessage.date)
        return NSAttributedString(string: dateStr)
    }
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, layout collectionViewLayout: JSQMessagesCollectionViewFlowLayout!, heightForMessageBubbleTopLabelAt indexPath: IndexPath!) -> CGFloat {
        return kJSQMessagesCollectionViewCellLabelHeightDefault
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, messageDataForItemAt indexPath: IndexPath!) -> JSQMessageData! {
        return messages[indexPath.item].0
    }
    
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return messages.count
    }
    
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = super.collectionView(collectionView, cellForItemAt: indexPath) as! JSQMessagesCollectionViewCell
        
        let interview = application.getInterview()
        if interview != nil {
            let (_, message) = messages[indexPath.row]
            if (interview?.messages.lastObject as! Message).id == message.id {
                let str: NSMutableAttributedString =  NSMutableAttributedString(string: "Interview: " + AppHelper.dateToLongString((interview?.at)!))
                str.addAttribute(NSUnderlineStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
                str.addAttribute(NSFontAttributeName, value: UIFont.systemFont(ofSize: 15), range: NSMakeRange(0, str.length))
                str.addAttribute(NSForegroundColorAttributeName, value: UIColor.white, range: NSMakeRange(0, str.length))
                
                let cellSize = cell.frame.size
                let button = UIButton(frame: CGRect(x: 20, y: cellSize.height - 75, width: cellSize.width, height: 35))
                button.setAttributedTitle(str, for: .normal)
                button.contentHorizontalAlignment = .left
                button.addTarget(self, action: #selector(showInterviewInfo), for: .touchUpInside)
                button.tag = 100
                cell.messageBubbleContainerView.addSubview(button)
                
                return cell
            }
        }
        
        if let button = cell.messageBubbleContainerView.viewWithTag(100) {
            button.removeFromSuperview()
        }
        
        return cell
    }
    
    override func didPressSend(_ button: UIButton!, withMessageText text: String!, senderId: String!, senderDisplayName: String!, date: Date!) {
        
//        messages.append(JSQMessage(senderId: senderId, senderDisplayName: senderDisplayName, date: Date(), text: text))

        finishSendingMessage()
        
        let message = MessageForCreation()
        message.content = text
        message.application = application.id
        
        API.shared().sendMessage(message: message, success: { (data) in
            
            AppData.getApplication(self.application.id, success: { (application) in
                self.application = application
                self.updateData()
            }, failure: nil)
            
        }, failure: nil)
    }
    
    func showInterviewInfo() {
        let controller = InterviewDetailController.instantiate()
        controller.application = application
        navigationController?.pushViewController(controller, animated: true)
    }
    
    func showLoading() -> LoadingController {
        let loading = LoadingController()
        loading.addToView(parentView: self.view)
        loading.view.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
        return loading
    }
    
    static func instantiate() -> MessageController {
        return AppHelper.instantiate("Message") as! MessageController
    }
}

