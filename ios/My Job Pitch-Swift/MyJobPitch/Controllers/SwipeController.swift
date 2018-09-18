//
//  SwipeController.swift
//  MyJobPitch
//
//  Created by dev on 12/22/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

protocol ControlDelegate {
    func apply(success: ((NSObject?) -> Void)?,
               failure: ((String?, NSDictionary?) -> Void)?)
    func remove(success: ((NSObject?) -> Void)?,
                failure: ((String?, NSDictionary?) -> Void)?)
}

class SwipeController: MJPController {
    
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var commentLabel: UILabel!
    
    @IBOutlet weak var cardsView: UIView!
    @IBOutlet weak var creditsButton: UIButton!
    @IBOutlet weak var emptyView: UILabel!
    
    var searchJob: Job!
    var jobSeeker: JobSeeker!
    var profile: Profile!
    
    var data: [MJPObject]!
    
    var cards = NSMutableArray()
    var currentIndex: Int = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if AppData.user.jobSeeker != nil {
            
            title = "Find Job"
            emptyView.text = "There are no more jobs that match your profile. You can restore your removed matches by clicking refresh above."
            imgView.superview?.isHidden = true
            creditsButton.superview?.isHidden = true
            
            let editMenu = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editProfile))
            navigationItem.rightBarButtonItems?.insert(editMenu, at: 0)
            
        } else {
            
            title = "Find Talent"
            emptyView.text = "There are no more new matches for this job. You can restore your removed matches by clicking refresh above."
            updateTokens()
        }
        
        refresh()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        if searchJob != nil {
            searchJob = (AppData.jobs.filter { $0.id === searchJob.id })[0]
            AppHelper.loadLogo(image: searchJob.getImage(), imageView: imgView, completion: nil)
            nameLabel.text = searchJob.title
            commentLabel.text = searchJob.getBusinessName()
        }
        
//        if AppData.user.isJobSeeker() {
//            showLoading()
//            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
//                self.hideLoading()
//                self.jobSeeker = data as! JobSeeker
////                self.showInactiveBanner()
//            }, failure: self.handleErrors)
//        }
    }
    
    func refresh() {
        
        showLoading()
        
        if AppData.user.isJobSeeker() {
            
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                
                self.jobSeeker = data as! JobSeeker
                
                API.shared().loadJobProfileWithId(id: self.jobSeeker.profile, success: { (data) in
                    
                    self.profile = data as! Profile
                    AppData.searchJobs(success: {
                        self.refreshCompleted(AppData.jsJobs)
                    }, failure: self.handleErrors)
                    
                }, failure: self.handleErrors)
                
            }, failure: self.handleErrors)
            
        } else {
            
            AppData.searchJobseekers(jobId: searchJob.id, success: {
                self.refreshCompleted(AppData.rcJobseekers)
            }, failure: self.handleErrors)
        }
    }
    
    func updateTokens() {
        let credits = searchJob.locationData.businessData.tokens as Int
        creditsButton.setTitle(String(format: "%d %@", credits, credits > 1 ? "Credits" : "Credit"), for: .normal)
    }
    
    func refreshCompleted(_ data: [MJPObject]) {
        
        hideLoading()
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
    
    func addCard() -> SwipeCard! {
        
        if currentIndex < data.count {
            
            let card = newCard(index: currentIndex)
            cardsView.insertSubview(card, at: 0)
            cards.add(card)
            updateCardPosition(index: cards.count-1)
            
            currentIndex += 1
            
            return card
        }
        
        return nil
    }
    
    func newCard(index: Int) -> SwipeCard {
        
        // swipe options
        let options = MDCSwipeToChooseViewOptions()
        options.likedText = AppData.user.isJobSeeker() ? "Apply" : "Connect"
        options.nopeText = "Remove"
        options.delegate = self
        options.likedColor = AppData.greenColor
        options.nopeColor = AppData.yellowColor
        options.threshold = UIScreen.main.bounds.size.width * 0.3
        
        // create swipe card
        let frame = CGRect(x: 10, y: 10, width: cardsView.frame.size.width-20, height: cardsView.frame.size.height - 30)
        let card = SwipeCard(frame: frame, options: options)!
        card.isUserInteractionEnabled = false
        
        if AppData.user.isJobSeeker() {
            
            let job = data[index] as! Job
            let workplace = job.locationData!
            let distance = AppHelper.distance(latitude1: profile.latitude!,
                                              longitude1: (profile.longitude)!,
                                              latitude2: (workplace.latitude)!,
                                              longitude2: (workplace.longitude)!)
            let logo = job.getImage()
            
            card.setImage(imageUrl: logo?.image, distance: distance, name: job.title, desc: job.desc)
            
            if logo == nil {
                card.imageView.image = UIImage(named: "default-logo")
            }
            
        } else {
            
            let jobSeeker = data[index] as! JobSeeker
            
            card.setImage(imageUrl: jobSeeker.profileImage, distance: "", name: jobSeeker.getFullName(), desc: jobSeeker.desc)
            
            if jobSeeker.profileImage == nil {
                card.imageView.image = UIImage(named: "avatar")
            }
        }
        
        return card
    }
    
    func updateCardPosition(index: Int) {
        
        if index < cards.count {
            let card = cards[index] as! SwipeCard
            card.center = CGPoint(x: cardsView.frame.size.width*0.5, y: card.frame.size.height*0.5+10+10*CGFloat(index))
        }
    }
    
    func reloadCard() {
        
        (cards.firstObject as! SwipeCard).removeFromSuperview()
        cards.removeObject(at: 0)
        
        let card = newCard(index: currentIndex - 1 - cards.count)
        
        cardsView.insertSubview(card, at: cards.count)
        cards.insert(card, at: 0)
        updateCardPosition(index: 0)
        
        showTopCardInfo()
    }
    
    func showTopCardInfo() {
        
        if cards.count > 0 {
            
            let card = cards.firstObject as! SwipeCard
            card.setTouchEvent(callback: {
                
                let item = self.data[self.currentIndex - self.cards.count]
                
                if AppData.user.isJobSeeker() {
                    let controller = ApplicationDetailsController.instantiate()
                    controller.job = item as! Job
                    controller.controlDelegate = self
                    self.navigationController?.pushViewController(controller, animated: true)
                } else {
                    let controller = JobSeekerDetailController.instantiate()
                    controller.jobSeeker = item as! JobSeeker
                    controller.controlDelegate = self
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            })
        }
        
        emptyView.isHidden = cards.count > 0
    }
    
    func editProfile() {
        let controller = JobSeekerProfileController.instantiate()
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func jobDetailAction(_ sender: Any) {
        let controller = AppHelper.instantiate("JobDetail") as! JobDetailController
        controller.job = searchJob
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func refreshAction(_ sender: Any) {
        refresh()
    }
    
    @IBAction func clickCredit(_ sender: Any) {
        let controller = BusinessEditController.instantiate()
        controller.business = searchJob.locationData.businessData
        navigationController?.pushViewController(controller, animated: true)
    }
    
    static func instantiate() -> SwipeController {
        return AppHelper.instantiate("Swipe") as! SwipeController
    }    
}

extension SwipeController: MDCSwipeToChooseDelegate {
    
    func view(_ view: UIView!, shouldBeChosenWith direction: MDCSwipeDirection) -> Bool {
        return true
    }
    
    func view(_ view: UIView!, wasChosenWith direction: MDCSwipeDirection) {
        if direction == .right {
            apply(success: nil, failure: handleErrors)
        } else {
            remove(success: nil, failure: nil)
        }
    }
}

extension SwipeController: ControlDelegate {
    func apply(success: ((NSObject?) -> Void)?,
               failure: ((String?, NSDictionary?) -> Void)?) {
        if AppData.user.isJobSeeker() {
            if !jobSeeker.active {
                PopupController.showGreen("To apply please activate your account", ok: "Activate", okCallback: {
                    self.editProfile()
                }, cancel: "Cancel", cancelCallback: nil)
                reloadCard()
                return
            }
            
            if jobSeeker.profileImage == nil {
                PopupController.showGreen("To apply please set your photo", ok: "Edit profile", okCallback: {
                    self.editProfile()
                }, cancel: "Cancel", cancelCallback: nil)
                reloadCard()
                return
            }
            
            if searchJob.requiresCV && jobSeeker.cv == nil {
                PopupController.showGreen("This job requires your cv", ok: "Edit profile", okCallback: {
                    self.editProfile()
                }, cancel: "Cancel", cancelCallback: nil)
                reloadCard()
                return
            }
        }
        
        let newApplication = ApplicationForCreation()
        let selectedId = data[currentIndex - cards.count].id
        if AppData.user.isJobSeeker() {
            newApplication.job = selectedId
            newApplication.jobSeeker = AppData.user.jobSeeker
        } else {
            newApplication.job = searchJob?.id
            newApplication.jobSeeker = selectedId
        }
        
        showLoading()
        API.shared().createApplication(application: newApplication, success: { (data) in
            
            self.hideLoading()
            
            if AppData.user.isRecruiter() {
                
                let newApplication = data as! ApplicationForCreation
                
                AppData.updateApplication(newApplication.id, success: { (application) in
                    self.searchJob = application.job
                    self.updateTokens()
                }, failure: self.handleErrors)
            }
            
            self.remove(success: nil, failure: nil)
            
        }) { (message, errors) in
            
            self.hideLoading()
            if errors?["NO_TOKENS"] != nil {
                PopupController.showGray("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", ok: "Ok")
            } else {
                self.handleErrors(message: message, errors: errors)
            }
            self.reloadCard()
        }
    }
    func remove(success: ((NSObject?) -> Void)?,
                failure: ((String?, NSDictionary?) -> Void)?) {
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


