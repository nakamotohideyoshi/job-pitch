//
//  SwipeController.swift
//  MyJobPitch
//
//  Created by dev on 12/22/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class SwipeController: MJPController {
    
    @IBOutlet weak var infoLabel: UILabel!
    @IBOutlet weak var cardsView: UIView!
    @IBOutlet weak var creditsButton: UIButton!
    @IBOutlet weak var emptyView: EmptyView!
    
    public var searchJob: Job!
    
    var data: [MJPObject]!
    
    var cards = NSMutableArray()
    var currentIndex: Int = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if AppData.user.isJobseeker() {
            
            title = NSLocalizedString("Find Job", comment: "")
            emptyView.message.text = NSLocalizedString("There are no more jobs that match your profile. You can restore your removed matches by clicking refresh above.", comment: "")
            infoLabel.superview?.isHidden = true
            creditsButton.superview?.isHidden = true
            
        } else {
            
            title = NSLocalizedString("Find Talent", comment: "")
            
            emptyView.button.setTitle(NSLocalizedString("Remove filter", comment: ""), for: .normal)
            updateEmptyView()
            updateTokens()
        }
        
        let editMenu = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editAction))
        navigationItem.rightBarButtonItems?.insert(editMenu, at: 0)
        
        refresh()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        if searchJob != nil {
            searchJob = (AppData.jobs.filter { $0.id === searchJob.id })[0]
            infoLabel.text = String(format: "%@, (%@)", searchJob.title, searchJob.getBusinessName())
        }
    }
    
    func refresh() {
        
        showLoading()
        
        if AppData.user.isJobseeker() {
            
            AppData.searchJobs() { error in
                if error == nil {
                    self.refreshCompleted(AppData.jobs)
                } else {
                    self.handleError(error)
                }
            }
            
        } else {
            
            AppData.searchJobseekers(jobId: searchJob.id) { error in
                if error == nil {
                    self.refreshCompleted(AppData.jobseekers)
                } else {
                    self.handleError(error)
                }
            }
        }
    }
    
    func updateEmptyView() {
        var str = NSLocalizedString("There are no more new matches for this job.", comment: "")
        if searchJob.requiresCV {
            str = String(format: "%@\n\n%@", str, NSLocalizedString("You are currently hiding job seekers who have not uploaded a CV", comment: ""))
        }
        if searchJob.requiresPitch {
            str = String(format: "%@\n%@", str, NSLocalizedString("You are currently hiding job seekers who have not uploaded a video pitch", comment: ""))
        }
        emptyView.message.text = str
        
        if searchJob.requiresCV || searchJob.requiresPitch {
            emptyView.action = {
                let controller = JobEditController.instantiate()
                controller.job = self.searchJob
                controller.saveComplete = { (job: Job) in
                    self.searchJob = job
                    self.updateEmptyView()
                    self.refresh()
                }
                self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
            }
        } else {
            emptyView.action = nil
        }
    }
    
    func updateTokens() {
        let tokens = searchJob.locationData.businessData.tokens // temp code
        let credits = tokens != nil ? (tokens as! Int) : 0
        creditsButton.setTitle(String(format: "%d %@", credits, credits > 1 ? NSLocalizedString("Credits", comment: "") : NSLocalizedString("Credit", comment: "")), for: .normal)
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
        options.likedText = AppData.user.isJobseeker() ? NSLocalizedString("Apply", comment: "") : NSLocalizedString("Connect", comment: "")
        options.nopeText = NSLocalizedString("Remove", comment: "")
        options.delegate = self
        options.likedColor = AppData.greenColor
        options.nopeColor = AppData.yellowColor
        options.threshold = UIScreen.main.bounds.size.width * 0.3
        
        // create swipe card
        let frame = CGRect(x: 10, y: 10, width: cardsView.frame.size.width-20, height: cardsView.frame.size.height - 30)
        let card = SwipeCard(frame: frame, options: options)!
        card.isUserInteractionEnabled = false
        
        if AppData.user.isJobseeker() {
            
            let job = data[index] as! Job
            let workplace = job.locationData!
            let distance = AppHelper.distance(latitude1: AppData.profile.latitude!,
                                              longitude1: (AppData.profile.longitude)!,
                                              latitude2: (workplace.latitude)!,
                                              longitude2: (workplace.longitude)!)
            let logo = job.getImage()
            
            card.setImage(imageUrl: logo?.image, distance: distance, name: job.title, desc: job.desc)
            
            if logo == nil {
                card.imageView.image = UIImage(named: "default-logo")
            }
            
        } else {
            
            let jobseeker = data[index] as! Jobseeker
            
            card.setImage(imageUrl: jobseeker.profileImage, distance: "", name: jobseeker.getFullName(), desc: jobseeker.desc)
            
            if jobseeker.profileImage == nil {
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
                
                if AppData.user.isJobseeker() {
                    let controller = ApplicationDetailsController.instantiate()
                    controller.job = item as! Job
                    controller.applyCallback = self.removeCard
                    controller.removeCallback = self.removeCard
                    self.navigationController?.pushViewController(controller, animated: true)
                } else {
                    let controller = JobseekerDetailsController.instantiate()
                    controller.jobseeker = item as! Jobseeker
                    controller.job = self.searchJob
                    controller.connectCallback = self.removeCard
                    controller.removeCallback = self.removeCard
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            })
        }
        
        emptyView.isHidden = cards.count > 0
    }
    
    func removeCard() {
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
    
    func editAction() {
        if AppData.user.isJobseeker() {
            let controller = JobseekerProfileController.instantiate()
            controller.isModal = true
            present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
        } else {
            let controller = JobDetailsController.instantiate()
            controller.job = self.searchJob
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    @IBAction func refreshAction(_ sender: Any) {
        refresh()
    }
    
    @IBAction func clickCredit(_ sender: Any) {
        let controller = BusinessEditController.instantiate()
        controller.business = searchJob.locationData.businessData
        navigationController?.pushViewController(controller, animated: true)
    }
    
    func apply() {
        if AppData.user.isJobseeker() {

            if (!AppData.jobseeker.active) {
                PopupController.showGreen(NSLocalizedString("To apply please activate your account", comment: ""),
                                          ok: NSLocalizedString("Activate", comment: ""), okCallback: {
                    self.editAction()
                }, cancel: NSLocalizedString("Cancel", comment: "")) {
                    self.reloadCard()
                }
                return
            }
            
            if (AppData.jobseeker.profileImage == nil) {
                PopupController.showGreen(NSLocalizedString("To apply please set your photo", comment: ""),
                                          ok: NSLocalizedString("Edit profile", comment: ""), okCallback: {
                    self.editAction()
                }, cancel: NSLocalizedString("Cancel", comment: "")) {
                    self.reloadCard()
                }
                return
            }
            
            let job = self.data[self.currentIndex - self.cards.count] as! Job
            if (job.requiresCV && AppData.jobseeker.cv == nil) {
                PopupController.showGreen(NSLocalizedString("Looks like this job wants you to upload a full CV before applying! You can upload a PDF or document to your profile.", comment: ""),
                                          ok: NSLocalizedString("Edit profile", comment: ""),
                                          okCallback: {
                    self.editAction()
                }, cancel: NSLocalizedString("Cancel", comment: "")) {
                    self.reloadCard()
                }
                return
            }
            
            let controller = JobApplyController.instantiate()
            controller.job = job
            controller.completeCallback = {
                self.removeCard()
            }
            present(UINavigationController(rootViewController: controller), animated: true, completion: nil)

            self.reloadCard()

        } else {
            
            let application = ApplicationForCreation()
            application.job = searchJob?.id
            application.jobseeker = data[currentIndex - cards.count].id
            
            API.shared().createApplication(application) { (result, error) in
                
                if result != nil {
                    AppData.updateJob(self.searchJob.id, complete: { (job, error) in
                        if job != nil {
                            self.searchJob = job
                            self.updateTokens()
                        } else {
                            self.handleError(error)
                        }
                    })
                    self.removeCard()
                } else {
                    self.handleError(error)
                    self.reloadCard()
                }
            }
        }
    }

    func remove() {
        
        if AppData.user.isRecruiter() {
            
            let request = ExclusionJobseeker()
            request.job = searchJob.id
            request.jobseeker = data[currentIndex - cards.count].id
            
            API.shared().ExclusionJobseeker(request) { (_, error) in
                if error == nil {
                    self.removeCard()
                } else {
                    self.handleError(error)
                    self.reloadCard()
                }
            }
            
        } else {
            removeCard()
        }
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
            apply()
        } else {
            remove()
        }
    }
}
