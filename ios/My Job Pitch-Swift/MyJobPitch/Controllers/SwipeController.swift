//
//  SwipeController.swift
//  MyJobPitch
//
//  Created by dev on 12/22/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MDCSwipeToChoose

class SwipeController: MJPController {

    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var cardsView: UIView!
    @IBOutlet weak var creditsButton: UIButton!
    
    @IBOutlet weak var emptyView: UILabel!
    
    var isFindJob = false
    var searchJob: Job!
    
    var cards = NSMutableArray()
    var data: NSArray!
    
    var card_height: CGFloat = 0
    var currentIndex: Int = 0
    
    var credits = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        isFindJob = SideMenuController.currentID == "find_job"
        
        navigationItem.title = SideMenuController.getCurrentTitle(isFindJob ? "find_job" : "find_talent")
        
        nameLabel.text = ""
        descriptionLabel.text = ""
        
        card_height = cardsView.frame.size.height - 40
        refresh()
        
        if AppData.user.isRecruiter() {
            credits = searchJob.locationData.businessData.tokens as Int
            creditsButton.setTitle(String(format: "%d %@", credits, credits > 1 ? "Credits" : "Credit"), for: .normal)
            emptyView.text = "There are no more new matches for this job. You can restore your removed matches by clicking refresh above."
        } else {
            creditsButton.removeFromSuperview()
            emptyView.text = "There are no more jobs that match your profile. You can restore your removed matches by clicking refresh above."
        }
        
    }
    
    func updateCardPosition(index: Int) {
        
        if index < cards.count {
            let card = cards[index] as! SwipeCard
            let ds = 0.05 * CGFloat(index)
            card.center = CGPoint(x: cardsView.frame.size.width*0.5, y: card_height*0.5+card_height*ds*1)
            card.transform = CGAffineTransform(scaleX: 1-ds, y: 1-ds)
        }
        
    }
    
    func addCard() -> SwipeCard! {
        
        if currentIndex < data.count {
            
            // swipe options
            let options = MDCSwipeToChooseViewOptions()
            options.likedText = isFindJob ? "Apply" : "Connect"
            options.nopeText = "Remove"
            options.delegate = self
            
            // create swipe card
            let frame = CGRect(x: 0, y: 0, width: cardsView.frame.size.width, height: card_height)
            let card = SwipeCard(frame: frame, options: options)!
            card.isUserInteractionEnabled = false
            cardsView.insertSubview(card, at: 0)
            cards.add(card)
            updateCardPosition(index: cards.count-1)
            
            if isFindJob {
                let job = data[currentIndex] as! Job
                let location = job.locationData!
                let profile = AppData.profile!
                let distance = AppHelper.distance(latitude1: profile.latitude!,
                                                  longitude1: (profile.longitude)!,
                                                  latitude2: (location.latitude)!,
                                                  longitude2: (location.longitude)!)
                card.setImage(imageUrl: job.getImage()?.image, text: distance)
            } else {
                let jobSeeker = data[currentIndex] as! JobSeeker
                let pitch = jobSeeker.getPitch()
                card.setImage(imageUrl: pitch?.thumbnail, text: "")
            }
            
            currentIndex += 1
            
            return card
        }
        
        return nil
        
    }
    
    func showTopCardInfo() {
        
        if cards.count > 0 {
            
            let card = cards.firstObject as! SwipeCard
            card.setTouchEvent(callback: {
                self.clickCard()
            })
            
            if isFindJob {
                let job = data[currentIndex - cards.count] as! Job
                nameLabel.text = job.title
                descriptionLabel.text = job.desc
            } else {
                let jobSeeker = data[currentIndex - cards.count] as! JobSeeker
                nameLabel.text = jobSeeker.firstName + " " + jobSeeker.lastName
                descriptionLabel.text = jobSeeker.desc
            }
            
        } else {
            nameLabel.text = ""
            descriptionLabel.text = ""
        }
        
        emptyView.isHidden = cards.count > 0
        
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        if isFindJob {
            
            API.shared().searchJobsWithExclusions(exclusions: [],
                                                  success: refreshCompleted) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        } else {
            
            API.shared().searchJobSeekersForJob(jobId: searchJob.id,
                                                exclusions: [],
                                                success: refreshCompleted) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
        
    }
    
    func refreshCompleted(data: NSArray) {
        
        AppHelper.hideLoading()
        self.data = data
        
        for card in cards {
            (card as! SwipeCard).removeFromSuperview()
        }
        cards.removeAllObjects()
        
        currentIndex = 0
        _ = addCard()
        _ = addCard()
        _ = addCard()
        
        showTopCardInfo()
        
    }

    @IBAction func clickCredit(_ sender: Any) {
        
        BusinessEditController.pushController(business: searchJob.locationData.businessData, callback: nil)
        
    }
    
    func clickCard() {
        
        if isFindJob {
            let job = data[currentIndex - cards.count] as! Job
            ApplicationDetailController.pushController(job: job,
                                               application: nil,
                                               chooseDelegate: self)
        } else {
            let jobSeeker = data[currentIndex - cards.count] as! JobSeeker
            JobSeekerDetailController.pushController(jobSeeker: jobSeeker,
                                                     application: nil,
                                                     job: searchJob,
                                                     chooseDelegate: self)
        }
        
    }
    
    @IBAction func refreshAction(_ sender: Any) {
        refresh()
    }
    
    static func pushController(job: Job!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Swipe") as! SwipeController
        controller.searchJob = job
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }
    
}

extension SwipeController: MDCSwipeToChooseDelegate {
    
    func view(_ view: UIView!, shouldBeChosenWith direction: MDCSwipeDirection) -> Bool {
        return true
    }
    
    func view(_ view: UIView!, wasChosenWith direction: MDCSwipeDirection) {
        if direction == .right {
            apply()
        } else {
            remove()
        }
    }
    
}

extension SwipeController: ChooseDelegate {
    
    func apply() {
        
        let application = ApplicationForCreation()
        
        if isFindJob {
            
            if AppData.jobSeeker.getPitch() == nil {
                PopupController.showGreen("You need to record your pitch video to apply.", ok: "Record my pitch", okCallback: {
                    SideMenuController.pushController(id: "add_record")
                }, cancel: "Cancel", cancelCallback: nil)
                remove()
                return
            }
            
            application.job = (data[currentIndex - cards.count] as! Job).id
            application.jobSeeker = AppData.user.jobSeeker
        } else {
            
            if searchJob.locationData.businessData.tokens == 0 {
                PopupController.showGray("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", ok: "Ok")
                remove()
                return
            }
            
            application.job = searchJob?.id
            application.jobSeeker = (data[currentIndex - cards.count] as! JobSeeker).id
        }
        
        application.shortlisted = false
        API.shared().createApplication(application: application, success: { (data) in
            
            if AppData.user.isRecruiter() {
                self.credits = self.credits - 1
                self.creditsButton.setTitle(String(format: "%d %@", self.credits, self.credits > 1 ? "Credits" : "Credit"), for: .normal)
            }
            
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
        remove()
        
    }
    
    func remove() {
        
        let card = addCard()
        if card != nil {
            card?.alpha = 0
        }
        
        (cards.firstObject as! SwipeCard).removeFromSuperview()
        cards.removeObject(at: 0)
        
        if cards.count > 0 {
            for index in 0...cards.count-1 {
                UIView.animate(withDuration: 0.2, animations: {
                    self.updateCardPosition(index: index)
                    card?.alpha = 1
                })
            }
        }
        
        showTopCardInfo()
        
    }
    
}

