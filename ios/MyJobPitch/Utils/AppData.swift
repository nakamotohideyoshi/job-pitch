
//  AppData.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class AppData: NSObject {
    
    // const
    
    static let apiVersion = 6
    static let production = false
    
    static let greenColor = UIColor(red: 0/255.0, green: 182/255.0, blue: 164/255.0, alpha: 1)
    static let yellowColor = UIColor(red: 1, green: 147/255.0, blue: 0, alpha: 1)
    static let lightGreyColor = UIColor(red: 235/255.0, green: 235/255.0, blue: 235/255.0, alpha: 1)
    static let greyColor = UIColor(red: 214/255.0, green: 214/255.0, blue: 214/255.0, alpha: 1)
    static let darkColor = UIColor(red: 51/255.0, green: 51/255.0, blue: 51/255.0, alpha: 1)
    
    static let DEFAULT_REFRESH_TIME = 30
    static let MESSAGE_REFRESH_TIME = 5
    
    // app data
    
    static var email: String! {
        get {
            return UserDefaults.standard.string(forKey: "email")
        }
        set(newEmail) {
            UserDefaults.standard.set(newEmail, forKey: "email")
            UserDefaults.standard.synchronize()
        }
    }
    
    static var user: User!

    static var hours: [Hours]!
    static var contracts: [Contract]!
    static var sexes: [Sex]!
    static var nationalities: [Nationality]!
    static var sectors: [Sector]!
    static var jobStatuses: [JobStatus]!
    static var applicationStatuses: [ApplicationStatus]!
    static var roles: [Role]!
    static var initialTokens: InitialTokens!
    
    static var userRole: NSNumber!
    static var jobSeeker: JobSeeker!
    static var profile: Profile!
    
    static var businesses = [Business]()
    static var workplaces = [Location]()
    static var jobs = [Job]()
    static var businessUsers = [BusinessUser]()
    static var jobSeekers = [JobSeeker]()
    static var applications = [Application]()
    static var newMessageCount = 0
    
    static var appsRefreshTime = DEFAULT_REFRESH_TIME
    static var appsUpdateCallback: (() -> Void)?
    
    static func clearData() {
        user = nil
        userRole = nil
        jobSeeker = nil
        profile = nil
        
        businesses.removeAll()
        workplaces.removeAll()
        jobs.removeAll()
        businessUsers.removeAll()
        jobSeekers.removeAll()
        applications.removeAll()
        
        stopTimer()
    }
    
    static func loadData(complete: ((Any?) -> Void)!) {
        
        var failed = false
        
        let loadFailure = { (error: Any?) in
            if !failed {
                failed = true
                complete(error)
            }
        }
        
        let loadSuccess = {
            if ( hours != nil &&
                contracts != nil &&
                sexes != nil &&
                nationalities != nil &&
                sectors != nil &&
                jobStatuses != nil &&
                applicationStatuses != nil &&
                roles != nil &&
                initialTokens != nil) {
                
                if (user.isJobSeeker()) {
                    
                    userRole = Role.ROLE_JOB_SEEKER_ID
                    
                    getJobSeeker() { error in
                        if error != nil {
                            complete(error)
                            return
                        }
                        getProfile() { error in
                            if error != nil {
                                complete(error)
                                return
                            }
                            getApplications() { error in
                                complete(error)
                                if error == nil {
                                    startTimer()
                                }
                                
                            }
                        }
                    }
                    
                } else if (user.isRecruiter()) {
                    
                    userRole = Role.ROLE_RECRUITER_ID
                    
                    getBusinesses() { error in
                        getApplications() { error in
                            complete(error)
                            if error == nil {
                                startTimer()
                            }
                        }
                    }
                } else {
                    complete(nil)
                }
            }
        }
        
        if initialTokens == nil {
            API.shared().loadHours() { (result, error) in
                if result != nil {
                    hours = result as! [Hours]
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadContracts() { (result, error) in
                if result != nil {
                    contracts = result as! [Contract]
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadSexes() { (result, error) in
                if result != nil {
                    sexes = result as! [Sex]
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadNationalities() { (result, error) in
                if result != nil {
                    nationalities = result as! [Nationality]
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadSectors() { (result, error) in
                if result != nil {
                    sectors = result as! [Sector]
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadJobStatuses() { (result, error) in
                if result != nil {
                    jobStatuses = result as! [JobStatus]
                    JobStatus.JOB_STATUS_OPEN_ID = getIdByName(jobStatuses, name: JobStatus.JOB_STATUS_OPEN)
                    JobStatus.JOB_STATUS_CLOSED_ID = getIdByName(jobStatuses, name: JobStatus.JOB_STATUS_CLOSED)
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadApplicationStatuses() { (result, error) in
                if result != nil {
                    applicationStatuses = result as! [ApplicationStatus]
                    ApplicationStatus.APPLICATION_CREATED_ID = getIdByName(applicationStatuses, name: ApplicationStatus.APPLICATION_CREATED)
                    ApplicationStatus.APPLICATION_ESTABLISHED_ID = getIdByName(applicationStatuses, name: ApplicationStatus.APPLICATION_ESTABLISHED)
                    ApplicationStatus.APPLICATION_DELETED_ID = getIdByName(applicationStatuses, name: ApplicationStatus.APPLICATION_DELETED)
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadRoles() { (result, error) in
                if result != nil {
                    roles = result as! [Role]
                    Role.ROLE_JOB_SEEKER_ID = getIdByName(roles, name: Role.ROLE_JOB_SEEKER)
                    Role.ROLE_RECRUITER_ID = getIdByName(roles, name: Role.ROLE_RECRUITER)
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
            
            API.shared().loadInitialTokens() { (result, error) in
                if result != nil {
                    initialTokens = result as! InitialTokens
                    loadSuccess()
                } else {
                    loadFailure(error)
                }
            }
        } else {
            loadSuccess()
        }
    }
    
    static func getIdByName(_ objects: [MJPObjectWithName], name: String!) -> NSNumber! {
        let filters = objects.filter { $0.name == name }
        return filters.count > 0 ? filters[0].id : nil
    }
    
    static func getNameByID(_ objects: [MJPObjectWithName], id: NSNumber!) -> String! {
        let filters = objects.filter { $0.id == id }
        return filters.count > 0 ? filters[0].name : nil
    }
    
    //================ jobseeker =============
    
    static func getJobSeeker(complete: ((Any?) -> Void)?) {
        if (user.isJobSeeker()) {
            API.shared().loadJobSeekerWithId(AppData.user.jobSeeker) { (result, error) in
                if result != nil {
                    jobSeeker = result as! JobSeeker
                }
                complete?(error)
            }
        } else {
            complete?(nil)
        }
    }
    
    static func getProfile(complete: ((Any?) -> Void)?) {
        if (jobSeeker?.profile != nil) {
            API.shared().loadJobProfileWithId(jobSeeker.profile) { (result, error) in
                if result != nil {
                    profile = result as! Profile
                }
                complete?(error)
            }
        } else {
            complete?(nil)
        }
    }

    //================ businesses =============
    
    static func getBusinesses(complete: ((Any?) -> Void)?) {
        API.shared().loadBusinesses() { (result, error) in
            if result != nil {
                businesses = result as! [Business]
            }
            complete?(error)
        }
    }
    
    static func updateBusiness(_ object: NSObject, complete: ((Business?, Any?) -> Void)?) {
        
        let _updateBusiness = { (newBusiness: Business) in
            var isNew = true
            
            for (index, business) in businesses.enumerated() {
                if business.id == newBusiness.id {
                    businesses[index] = newBusiness
                    isNew = false
                    break
                }
            }
            
            if isNew {
                businesses.insert(newBusiness, at: 0)
            }
            
            complete?(newBusiness, nil)
        }
        
        if let newBusiness = object as? Business {
            _updateBusiness(newBusiness)
        } else {
            API.shared().loadBusiness(object as! NSNumber) { (result, error) in
                if result != nil {
                    _updateBusiness(result as! Business)
                } else {
                    complete?(nil, error)
                }
            }
        }
    }
    
    static func removeBusiness(_ business: Business, complete: ((Any?) -> Void)?) {
        API.shared().deleteBusiness(business.id) { error in
            if error == nil {
                businesses = businesses.filter { $0.id != business.id }
            }
            complete?(error)
        }
    }
    
    //================ workplaces =============
    
    static func getWorkplaces(businessId: NSNumber, complete: ((Any?) -> Void)?) {
        API.shared().loadLocationsForBusiness(businessId) { (result, error) in
            if (result != nil) {
                workplaces = result as! [Location]
            }
            complete?(error)
        }
    }
    
    static func updateWorkplace(_ object: NSObject, complete: ((Location?, Any?) -> Void)?) {
        
        let _updateWorkplace = { (newWorkplace: Location) in
            var isNew = true
            
            for (index, location) in workplaces.enumerated() {
                if location.id == newWorkplace.id {
                    workplaces[index] = newWorkplace
                    isNew = false
                    break
                }
            }
            
            if isNew {
                workplaces.insert(newWorkplace, at: 0)
            }
            
            updateBusiness(newWorkplace.businessData, complete: nil)
            
            complete?(newWorkplace, nil)
        }
        
        if let newWorkplace = object as? Location {
            _updateWorkplace(newWorkplace)
        } else {
            API.shared().loadLocation(object as! NSNumber) { (result, error) in
                if (error == nil) {
                    _updateWorkplace(result as! Location)
                } else {
                    complete?(nil, error)
                }
            }
        }
    }
    
    static func removeWorkplace(_ workplace: Location, complete: ((Any?) -> Void)?) {
        API.shared().deleteLocation(workplace.id) { error in
            if error == nil {
                workplaces = workplaces.filter { $0.id != workplace.id }
                let businesses1 = businesses.filter { $0.id == workplace.businessData.id }
                if businesses1.count > 0 {
                    businesses1[0].locations = (businesses1[0].locations as! [NSNumber]).filter { $0 != workplace.id } as NSArray!
                }
            }
            complete?(error)
        }
    }
    
    //================ jobs =============
    
    static func getJobs(locationId: NSNumber!, complete: ((Any?) -> Void)?) {
        API.shared().loadJobsForLocation(locationId) { (result, error) in
            if result != nil {
                jobs = result as! [Job]
            }
            complete?(error)
        }
    }
    
    static func searchJobs(complete: ((Any?) -> Void)?) {
        API.shared().searchJobs() { (result, error) in
            if result != nil {
                jobs = result as! [Job]
            }
            complete?(error)
        }
    }
    
    static func updateJob(_ object: NSObject, complete: ((Job?, Any?) -> Void)?) {
        
        let _updateJob = { (newJob: Job) in
            var isNew = true
            
            for (index, job) in jobs.enumerated() {
                if job.id == newJob.id {
                    jobs[index] = newJob
                    isNew = false
                    break
                }
            }
            
            if isNew {
                jobs.insert(newJob, at: 0)
            }
            
            updateWorkplace(newJob.locationData, complete: nil)

            complete?(newJob, nil)
        }
        
        if let newJob = object as? Job {
            _updateJob(newJob)
        } else {
            API.shared().loadJob(object as! NSNumber) { (result, error) in
                if result != nil {
                    _updateJob(result as! Job)
                } else {
                    complete?(nil, error)
                }
            }
        }
    }
    
    static func removeJob(_ job: Job, complete: ((Any?) -> Void)?) {
        API.shared().deleteJob(job.id) { error in
            if error == nil {
                jobs = jobs.filter { $0.id != job.id }
                let workplaces1 = workplaces.filter { $0.id == job.locationData.id }
                if workplaces1.count > 0 {
                    workplaces1[0].jobs = (workplaces1[0].jobs as! [NSNumber]).filter { $0 != job.id } as NSArray!
                }
            }
            complete?(error)
        }
    }
    
    //================ jobseekers =============
    
    static func searchJobseekers(jobId: NSNumber, complete: ((Any?) -> Void)?) {
        API.shared().searchJobSeekersForJob(jobId) { (result, error) in
            if result != nil {
                jobSeekers = result as! [JobSeeker]
            }
            complete?(error)
        }
    }
    
    static func removeJobseeker(_ jobseekerId: NSNumber) {
        for (index, jobseeker) in jobSeekers.enumerated() {
            if jobseeker.id == jobseekerId {
                jobSeekers.remove(at: index)
                break
            }
        }
    }
    
    //================ business users =============
    
    static func getBusinessUsers(businessId: NSNumber, complete: ((Any?) -> Void)?) {
        API.shared().loadBusinessUsers(businessId) { (result, error) in
            if result != nil {
                businessUsers = result as! [BusinessUser]
            }
            complete?(error)
        }
    }
    
    static func getBusinessUser(businessId: NSNumber, userId: NSNumber, complete: ((BusinessUser?, Any?) -> Void)?) {
        API.shared().getBusinessUser(businessId: businessId, businessUserId: userId) { (result, error) in
            let newBusinessUser = result as? BusinessUser
            if newBusinessUser != nil {
                var isNew = true
                for (index, user) in businessUsers.enumerated() {
                    if user.id == newBusinessUser?.id {
                        businessUsers[index] = newBusinessUser!
                        isNew = false
                        break
                    }
                }
                
                if isNew {
                    businessUsers.append(newBusinessUser!)
                }
            }
            
            complete?(newBusinessUser, error)
        }
    }
    
    static func removeBusinessUser(_ userId: NSNumber) {
        for (index, user) in businessUsers.enumerated() {
            if user.id == userId {
                businessUsers.remove(at: index)
                break
            }
        }
    }
    
    //================ applications =============
    
    private static var timer: Timer?
    private static var time = 0
    
    private static func startTimer() {
        if timer == nil {
            time = 0
            timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(refreshApplications), userInfo: nil, repeats: true)
        }
    }
    
    private static func stopTimer() {
        if timer != nil {
            timer?.invalidate()
            timer = nil
        }
    }
    
    private static func getNewMessageCount() {
        newMessageCount = 0
        
        for application in applications {
            newMessageCount += application.getNewMessageCount()
        }
    }
    
    static func refreshApplications() {
        time += 1
        if time >= appsRefreshTime {
            time = 0
            getApplications() { error in
                if error == nil {
                    appsUpdateCallback?()
                }
            }
        }
    }
    
    static func getApplications(complete: ((Any?) -> Void)?) {
        API.shared().loadApplications() { (result, error) in
            if result != nil {
                applications = result as! [Application]
                getNewMessageCount()
            }
            complete?(error)
        }
    }
    
    static func getApplication(_ id: NSNumber, complete: ((Application?, Any?) -> Void)?) {
        API.shared().loadApplicationWithId(id) { (result, error) in
            let newApplication = result as? Application
            if newApplication != nil {
                var isNew = true
                for (index, application) in applications.enumerated() {
                    
                    if application.id == newApplication?.id {
                        applications[index] = newApplication!
                        isNew = false
                        break
                    }
                }
                
                if isNew {
                    applications.insert(newApplication!, at: 0)
                }
                
                getNewMessageCount()
            }

            complete?(newApplication, error)
        }
    }
    
}
