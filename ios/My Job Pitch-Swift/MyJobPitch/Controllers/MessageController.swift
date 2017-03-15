//
//  MessageController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import JSQMessagesViewController

class MessageController: JSQMessagesViewController {
    
    var application: Application!
    
    var messages = [JSQMessage]()
    
    var senderBubbleImage: JSQMessagesBubbleImage!
    var senderAvatar: JSQMessagesAvatarImage!
    
    var receiverDisplayName: String!
    var receiverBubbleImage: JSQMessagesBubbleImage!
    var receiverAvatar: JSQMessagesAvatarImage!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        inputToolbar.contentView.leftBarButtonItem = nil
        
        senderId = "sender"
        
        let bubbleFactory = JSQMessagesBubbleImageFactory()
        receiverBubbleImage = bubbleFactory?.incomingMessagesBubbleImage(with: AppData.yellowColor)
        senderBubbleImage = bubbleFactory?.outgoingMessagesBubbleImage(with: AppData.greenColor)
        
        let job = application.job!
        let jobSeeker = application.jobSeeker!
        let jobImage = job.getImage()?.thumbnail
        let jobSeekerImage = jobSeeker.getPitch()?.thumbnail
        let statusCreated = AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_CREATED).id
        let statusDeleted = AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_DELETED).id
        
        if AppData.user.isJobSeeker() {
            
            senderDisplayName = jobSeeker.getFullName()
            receiverDisplayName = job.locationData.businessData.name
            
            setAavatar(sender: true, path: jobSeekerImage, local: "no-img")
            setAavatar(sender: false, path: jobImage, local: "default-logo")
            
            if application.status == statusCreated {
                
                inputToolbar.isUserInteractionEnabled = false
                PopupController.showGray("You cannot send messages until your application is accepted", ok: "OK")
                
            }
            
        } else {
            
            senderDisplayName = job.locationData.businessData.name
            receiverDisplayName = jobSeeker.getFullName()
            
            setAavatar(sender: true, path: jobImage, local: "default-logo")
            setAavatar(sender: false, path: jobSeekerImage, local: "no-img")
            
            if application.status == statusCreated {
                inputToolbar.isUserInteractionEnabled = false
                PopupController.showGray("You cannot send messages until you have connected", ok: "OK")
            } else if application.status == statusDeleted {
                inputToolbar.isUserInteractionEnabled = false
                PopupController.showGray("This application has been deleted.", ok: "OK")
            }
            
        }
        
        for message in application.messages as! [Message] {
            
            if message.fromRole == AppData.getUserRole().id {
                let jsqMessage = JSQMessage(senderId: senderId,
                                            senderDisplayName: senderDisplayName,
                                            date: message.created,
                                            text: message.content)
                messages.append(jsqMessage!)
            } else {
                let jsqMessage = JSQMessage(senderId: "receiver",
                                            senderDisplayName: receiverDisplayName,
                                            date: message.created,
                                            text: message.content)
                messages.append(jsqMessage!)
            }
            
        }
        
        if let pitch = jobSeeker.getPitch() {
            NSURLConnection.sendAsynchronousRequest(URLRequest(url: (URL(string:pitch.thumbnail))!),
                                                    queue: OperationQueue.main) { (response, data, error) in
                                                        if data != nil {
                                                            let avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(data: data!), diameter: 10)
                                                            if AppData.user.isJobSeeker() {
                                                                self.senderAvatar = avatarImage
                                                            } else {
                                                                self.receiverAvatar = avatarImage
                                                            }
                                                            self.collectionView.reloadData()
                                                        }
            }
        } else {
            let avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(named: "no-img"), diameter: 10)
            if AppData.user.isJobSeeker() {
                self.senderAvatar = avatarImage
            } else {
                self.receiverAvatar = avatarImage
            }
        }

        
    }
    
    func setAavatar(sender: Bool, path: String!, local: String!) {
        
        if path != nil {
            NSURLConnection.sendAsynchronousRequest(URLRequest(url: (URL(string:path))!),
                                                    queue: OperationQueue.main) { (response, data, error) in
                                                        var avatarImage: JSQMessagesAvatarImage!
                                                        if data != nil {
                                                            avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(data: data!), diameter: 15)
                                                        } else {
                                                            avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(named: local), diameter: 15)
                                                        }
                                                        
                                                        if sender {
                                                            self.senderAvatar = avatarImage
                                                        } else {
                                                            self.receiverAvatar = avatarImage
                                                        }
                                                        
                                                        self.collectionView.reloadData()
            }
        } else {
            let avatarImage = JSQMessagesAvatarImageFactory.avatarImage(with: UIImage(named: local), diameter: 15)
            if sender {
                self.senderAvatar = avatarImage
            } else {
                self.receiverAvatar = avatarImage
            }
        }
        
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, messageBubbleImageDataForItemAt indexPath: IndexPath!) -> JSQMessageBubbleImageDataSource! {
        let message = messages[indexPath.row]
        return message.senderId == senderId ? senderBubbleImage : receiverBubbleImage
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, avatarImageDataForItemAt indexPath: IndexPath!) -> JSQMessageAvatarImageDataSource! {
        let message = messages[indexPath.row]
        return message.senderId == senderId ? senderAvatar : receiverAvatar
    }

    override func collectionView(_ collectionView: JSQMessagesCollectionView!, layout collectionViewLayout: JSQMessagesCollectionViewFlowLayout!, heightForCellBottomLabelAt indexPath: IndexPath!) -> CGFloat {
        return kJSQMessagesCollectionViewCellLabelHeightDefault
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, attributedTextForCellBottomLabelAt indexPath: IndexPath!) -> NSAttributedString! {
        let message = messages[indexPath.row]
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMM dd, HH:mm a"
        let dateStr = dateFormatter.string(from: message.date)
        return NSAttributedString(string: dateStr)
    }
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, layout collectionViewLayout: JSQMessagesCollectionViewFlowLayout!, heightForMessageBubbleTopLabelAt indexPath: IndexPath!) -> CGFloat {
        return kJSQMessagesCollectionViewCellLabelHeightDefault
    }
    
    override func collectionView(_ collectionView: JSQMessagesCollectionView!, messageDataForItemAt indexPath: IndexPath!) -> JSQMessageData! {
        return messages[indexPath.item]
    }
    
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return messages.count
    }
    
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = super.collectionView(collectionView, cellForItemAt: indexPath) as! JSQMessagesCollectionViewCell
        
        return cell
    }
    
    override func didPressSend(_ button: UIButton!, withMessageText text: String!, senderId: String!, senderDisplayName: String!, date: Date!) {
        
        messages.append(JSQMessage(senderId: senderId, senderDisplayName: senderDisplayName, date: Date(), text: text))
        
        collectionView.reloadData()
        
        finishSendingMessage()
        
        let message = MessageForCreation()
        message.content = text
        message.application = application.id
        API.shared().sendMessage(message: message, success: { (data) in
            
        }) { (message, errors) in
            
        }
    }
    
}
