//
//  SwipeController.swift
//  MyJobPitch
//
//  Created by dev on 12/22/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class SwipeController: MJPController {

    @IBOutlet weak var cardsView: UIView!
    @IBOutlet weak var creditsButton: UIButton!
    
    @IBOutlet weak var emptyView: UILabel!
    @IBOutlet weak var noRecordView: UIView!
    @IBOutlet weak var jobTitleView: UILabel!
    
    var isFindJob = false
    var isRefresh = true
    var searchJob: Job!
    
    var cards = NSMutableArray()
    var data: NSArray!
    
    var currentIndex: Int = 0
    
    var jobSeeker: JobSeeker!
    var profile: Profile!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        isFindJob = SideMenuController.currentID == "find_job"
        
        navigationItem.title = SideMenuController.getCurrentTitle(isFindJob ? "find_job" : "find_talent")
        
        
        refresh()
        
        if AppData.user.isRecruiter() {
            let credits = searchJob.locationData.businessData.tokens as Int
            creditsButton.setTitle(String(format: "%d %@", credits, credits > 1 ? "Credits" : "Credit"), for: .normal)
            emptyView.text = "There are no more new matches for this job. You can restore your removed matches by clicking refresh above."
            jobTitleView.text = searchJob.title + ", (" + searchJob.getBusinessName() + ")"
            let item = UIBarButtonItem(barButtonSystemItem: .compose, target: self, action: #selector(goJobDetail))
            navigationItem.rightBarButtonItems?.append(item)
        } else {
            creditsButton.removeFromSuperview()
            emptyView.text = "There are no more jobs that match your profile. You can restore your removed matches by clicking refresh above."
            
            let item = UIBarButtonItem(barButtonSystemItem: .compose, target: self, action: #selector(self.goProfile))
            self.navigationItem.rightBarButtonItems?.append(item)
            
            if (jobSeeker != nil) {
                showInactiveBanner()
            }
        }
        if (AppData.newMessagesCount > 0) {
            let item1 = UIBarButtonItem(title: "All Messages", style: .plain, target: self, action: #selector(goAllMessageList))
            var fileName: String!
            if (AppData.newMessagesCount<10) {
                fileName =  "nav-message\(AppData.newMessagesCount)"
            } else {
                fileName = "nav-message10"
            }
            item1.image = UIImage(named: fileName)
            navigationItem.rightBarButtonItems?.append(item1)
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        showLoading()
        if !AppData.user.isRecruiter() {
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                self.hideLoading()
                self.jobSeeker = data as! JobSeeker
                self.showInactiveBanner()
            }, failure: self.handleErrors)
        }
    }
    
    func goAllMessageList() {
        SideMenuController.pushController(id: "messages")
    }
    
    func updateCardPosition(index: Int) {
        
        if index < cards.count {
            let card = cards[index] as! SwipeCard
            card.center = CGPoint(x: cardsView.frame.size.width*0.5, y: card.frame.size.height*0.5+10+10*CGFloat(index))
        }
        
    }
    
    func showInactiveBanner () {
        if !self.jobSeeker.active {
            self.jobTitleView.text = "Your profile is not activate"
        } else {
            self.jobTitleView.text = ""
        }
    }
    
    func goJobDetail(_ sender: Any) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobDetail") as! JobDetailController
        controller.job = searchJob
        navigationController?.pushViewController(controller, animated: true)
    }
    
    func goProfile(_ sender: Any) {
        isRefresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerProfile") as! JobSeekerProfileController
        controller.activation = true
        AppHelper.getFrontController().navigationController?.present(controller, animated: true)
    }
    
    func newCard(index: Int) -> SwipeCard {
        
        // swipe options
        let options = MDCSwipeToChooseViewOptions()
        options.likedText = isFindJob ? "Apply" : "Connect"
        options.nopeText = "Remove"
        options.delegate = self
        options.likedColor = AppData.greenColor
        options.nopeColor = AppData.yellowColor
        options.threshold = UIScreen.main.bounds.size.width * 0.3
        
        // create swipe card
        let frame = CGRect(x: 10, y: 10, width: cardsView.frame.size.width-20, height: cardsView.frame.size.height - 30)
        let card = SwipeCard(frame: frame, options: options)!
        card.isUserInteractionEnabled = false
        
        if isFindJob {
            let job = data[index] as! Job
            let location = job.locationData!
            let distance = AppHelper.distance(latitude1: profile.latitude!,
                                              longitude1: (profile.longitude)!,
                                              latitude2: (location.latitude)!,
                                              longitude2: (location.longitude)!)
            card.setImage(imageUrl: job.getImage()?.image, distance: distance, name: job.title, desc: job.desc)
        } else {
            let jobSeeker = data[index] as! JobSeeker
            let pitch = jobSeeker.getPitch()
            card.setImage(imageUrl: pitch?.thumbnail, distance: "", name: jobSeeker.getFullName(), desc: jobSeeker.desc)
        }
        
        return card
        
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
                self.clickCard()
            })
        }
        
        emptyView.isHidden = cards.count > 0
        
    }
    
    func refresh() {
        
        showLoading()
        
        if isFindJob {
            
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                self.jobSeeker = data as! JobSeeker
                
                self.showInactiveBanner()
                
                if self.jobSeeker.getPitch() != nil {
                    API.shared().loadJobProfileWithId(id: self.jobSeeker.profile, success: { (data) in
                        self.profile = data as! Profile
                        API.shared().searchJobsWithExclusions(exclusions: [],
                                                              success: self.refreshCompleted,
                                                              failure: self.handleErrors)
                    }, failure: self.handleErrors)
                } else {
                    self.noRecordView.isHidden = false
                    self.hideLoading()
                }
            }, failure: self.handleErrors)
            
        } else {
            
            API.shared().searchJobSeekersForJob(jobId: searchJob.id,
                                                exclusions: [],
                                                success: refreshCompleted,
                                                failure: self.handleErrors)
        }
        
    }
    
    func refreshCompleted(data: NSArray) {
        
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

    @IBAction func clickCredit(_ sender: Any) {
        BusinessEditController.pushController(business: searchJob.locationData.businessData)        
    }
    
    func clickCard() {
        
        if isFindJob {
            let job = data[currentIndex - cards.count] as! Job
            ApplicationDetailsController.pushController(job: job,
                                                       application: nil,
                                               chooseDelegate: self)
        } else {
            let jobSeeker = data[currentIndex - cards.count] as! JobSeeker
            JobSeekerDetailController.pushController(jobSeeker: jobSeeker,
                                                     job: searchJob,
                                                     application: nil,
                                                     chooseDelegate: self)
        }
        
    }
    
    @IBAction func refreshAction(_ sender: Any) {
        refresh()
    }
    
    @IBAction func goRecordNow(_ sender: Any) {
        SideMenuController.pushController(id: "add_record")
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
            apply(callback: nil)
        } else {
            remove()
        }
    }
    
}

extension SwipeController: ChooseDelegate {
    
    func apply(callback: (()->Void)!) {
        
        if AppData.user.isJobSeeker(){
            if (!jobSeeker.active) {
                PopupController.showGreen("To apply please activate your account", ok: "activate", okCallback: {
                    let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerProfile") as! JobSeekerProfileController
                    controller.activation = true
                    AppHelper.getFrontController().navigationController?.present(controller, animated: true)
                }, cancel: "Cancel", cancelCallback: nil)
                reloadCard()
                return
            }
        }        
        
        if isFindJob && jobSeeker.getPitch() == nil {
            PopupController.showGreen("You need to record your pitch video to apply.", ok: "Record my pitch", okCallback: {
                SideMenuController.pushController(id: "add_record")
            }, cancel: "Cancel", cancelCallback: nil)
            reloadCard()
            return
        }
        
        let application = ApplicationForCreation()
        application.shortlisted = false
        if isFindJob {
            application.job = (data[currentIndex - cards.count] as! Job).id
            application.jobSeeker = AppData.user.jobSeeker
        } else {
            application.job = searchJob?.id
            application.jobSeeker = (data[currentIndex - cards.count] as! JobSeeker).id
        }
        
        showLoading()
        API.shared().createApplication(application: application, success: { (data) in
            self.hideLoading()
            if AppData.user.isRecruiter() {
                let application = data as! ApplicationForCreation
                API.shared().loadApplicationWithId(id: application.id, success: { (data) in
                    self.searchJob = (data as! Application).job
                    let credits = self.searchJob.locationData.businessData.tokens as Int
                    self.creditsButton.setTitle(String(format: "%d %@", credits, credits > 1 ? "Credits" : "Credit"), for: .normal)
                }, failure: { (message, errors) in
                })
            }
            self.remove()
            if callback != nil {
                callback()
            }
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

