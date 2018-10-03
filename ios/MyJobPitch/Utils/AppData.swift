
//  AppData.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class AppData: NSObject {
    
    // const
    
    static let apiVersion = 5
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
    
    static func loadData(success: (() -> Void)!,
                         failure: ((String?, NSDictionary?) -> Void)!) {
        
        var failed = false
        
        let loadFailure = { (message: String?, errors: NSDictionary?) in
            if !failed {
                failed = true
                failure(message, errors)
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
                    
                    getJobSeeker(success: {
                        getProfile(success: {
                            getApplications(success: {
                                success()
                                startTimer()
                            }, failure: failure)
                        }, failure: loadFailure)
                    }, failure: loadFailure)
                    
                } else if (user.isRecruiter()) {
                    
                    userRole = Role.ROLE_RECRUITER_ID
                    
                    getBusinesses(success: { 
                        getApplications(success: {
                            success()
                            startTimer()
                        }, failure: failure)
                    }, failure: loadFailure)
                }
            }
        }
        
        if initialTokens == nil {
            API.shared().loadHours(success: { (data) in
                hours = data as! [Hours]
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadContracts(success: { (data) in
                contracts = data as! [Contract]
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadSexes(success: { (data) in
                sexes = data as! [Sex]
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadNationalities(success: { (data) in
                nationalities = data as! [Nationality]
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadSectors(success: { (data) in
                sectors = data as! [Sector]
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadJobStatuses(success: { (data) in
                jobStatuses = data as! [JobStatus]
                JobStatus.JOB_STATUS_OPEN_ID = getIdByName(jobStatuses, name: JobStatus.JOB_STATUS_OPEN)
                JobStatus.JOB_STATUS_CLOSED_ID = getIdByName(jobStatuses, name: JobStatus.JOB_STATUS_CLOSED)
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadApplicationStatuses(success: { (data) in
                applicationStatuses = data as! [ApplicationStatus]
                ApplicationStatus.APPLICATION_CREATED_ID = getIdByName(applicationStatuses, name: ApplicationStatus.APPLICATION_CREATED)
                ApplicationStatus.APPLICATION_ESTABLISHED_ID = getIdByName(applicationStatuses, name: ApplicationStatus.APPLICATION_ESTABLISHED)
                ApplicationStatus.APPLICATION_DELETED_ID = getIdByName(applicationStatuses, name: ApplicationStatus.APPLICATION_DELETED)
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadRoles(success: { (data) in
                roles = data as! [Role]
                Role.ROLE_JOB_SEEKER_ID = getIdByName(roles, name: Role.ROLE_JOB_SEEKER)
                Role.ROLE_RECRUITER_ID = getIdByName(roles, name: Role.ROLE_RECRUITER)
                loadSuccess()
            }, failure: loadFailure)
            
            API.shared().loadInitialTokens(success: { (data) in
                initialTokens = data as! InitialTokens
                loadSuccess()
            }, failure: loadFailure)
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
    
    static func getJobSeeker(success: (() -> Void)?,
                             failure: ((String?, NSDictionary?) -> Void)?) {
        if (user.isJobSeeker()) {
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                jobSeeker = data as! JobSeeker
                success?()
            }, failure: failure)
        } else {
            success?()
        }
    }
    
    static func getProfile(success: (() -> Void)?,
                           failure: ((String?, NSDictionary?) -> Void)?) {
        if (jobSeeker?.profile != nil) {
            API.shared().loadJobProfileWithId(id: jobSeeker.profile, success: { (data) in
                profile = data as! Profile
                success?()
            }, failure: failure)
        } else {
            success?()
        }
    }

    //================ businesses =============
    
    static func getBusinesses(success: (() -> Void)?,
                              failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadBusinesses(success: { (data) in
            businesses = data as! [Business]
            success?()
        }, failure: failure)
    }
    
    static func updateBusiness(_ object: NSObject,
                            success: ((Business) -> Void)?,
                            failure: ((String?, NSDictionary?) -> Void)?) {
        
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
            
            success?(newBusiness)
        }
        
        if let newBusiness = object as? Business {
            _updateBusiness(newBusiness)
        } else {
            API.shared().loadBusiness(id: object as! NSNumber, success: { (data) in
                _updateBusiness(data as! Business)
            }, failure: failure)
        }
    }
    
    static func removeBusiness(_ business: Business,
                               success: (() -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().deleteBusiness(id: business.id, success: {
            businesses = businesses.filter { $0.id != business.id }
            success?()
        }, failure: failure)
    }
    
    //================ workplaces =============
    
    static func getWorkplaces(businessId: NSNumber,
                             success: (() -> Void)?,
                             failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadLocationsForBusiness(businessId: businessId, success: { (data) in
            workplaces = data as! [Location]
            success?()
        }, failure: failure)
    }
    
    static func updateWorkplace(_ object: NSObject,
                               success: ((Location) -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {

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
            
            updateBusiness(newWorkplace.businessData, success: nil, failure: nil)
            
            success?(newWorkplace)
        }
        
        if let newWorkplace = object as? Location {
            _updateWorkplace(newWorkplace)
        } else {
            API.shared().loadLocation(id: object as! NSNumber, success: { (data) in
                _updateWorkplace(data as! Location)
            }, failure: failure)
        }
    }
    
    static func removeWorkplace(_ workplace: Location,
                                success: (() -> Void)?,
                                failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().deleteLocation(id: workplace.id, success: {
            workplaces = workplaces.filter { $0.id != workplace.id }
            let businesses1 = businesses.filter { $0.id == workplace.businessData.id }
            if businesses1.count > 0 {
                businesses1[0].locations = (businesses1[0].locations as! [NSNumber]).filter { $0 != workplace.id } as NSArray!
            }
            success?()
        }, failure: failure)
    }
    
    //================ jobs =============
    
    static func getJobs(locationId: NSNumber!,
                        success: (() -> Void)?,
                        failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadJobsForLocation(locationId: locationId, success: { (data) in
            jobs = data as! [Job]
            success?()
        }, failure: failure)
    }
    
    static func searchJobs(success: (() -> Void)?,
                           failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().searchJobs(success: { (data) in
            jobs = data as! [Job]
            success?()
        }, failure: failure)
    }
    
    static func updateJob(_ object: NSObject,
                       success: ((Job) -> Void)?,
                       failure: ((String?, NSDictionary?) -> Void)?) {
        
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
            
            updateWorkplace(newJob.locationData, success: nil, failure: nil)

            success?(newJob)
        }
        
        if let newJob = object as? Job {
            _updateJob(newJob)
        } else {
            API.shared().loadJob(id: object as! NSNumber, success: { (data) in
                let newJob = data as! Job
                _updateJob(newJob)
            }, failure: failure)
        }
    }
    
    static func removeJob(_ job: Job,
                          success: (() -> Void)?,
                          failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().deleteJob(id: job.id, success: {
            jobs = jobs.filter { $0.id != job.id }
            let workplaces1 = workplaces.filter { $0.id == job.locationData.id }
            if workplaces1.count > 0 {
                workplaces1[0].jobs = (workplaces1[0].jobs as! [NSNumber]).filter { $0 != job.id } as NSArray!
            }
            success?()
        }, failure: failure)
    }
    
    //================ jobseekers =============
    
    static func searchJobseekers(jobId: NSNumber,
                                 success: (() -> Void)?,
                                 failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().searchJobSeekersForJob(jobId: jobId, success: { (data) in
            jobSeekers = data as! [JobSeeker]
            success?()
        }, failure: failure)
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
    
    static func getBusinessUsers(businessId: NSNumber,
                         success: (() -> Void)?,
                         failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadBusinessUsers(businessId: businessId, success: { (data) in
            businessUsers = data as! [BusinessUser]
            success?()
        }, failure: failure)
    }
    
    static func getBusinessUser(businessId: NSNumber,
                                userId: NSNumber,
                                success: ((BusinessUser) -> Void)?,
                                failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().getBusinessUser(businessId: businessId, businessUserId: userId, success: { (data) in
            let newUser: BusinessUser! = data as! BusinessUser
            var isNew = true
            for (index, user) in businessUsers.enumerated() {
                if user.id == newUser.id {
                    businessUsers[index] = newUser
                    isNew = false
                    break
                }
            }
            
            if isNew {
                businessUsers.append(newUser)
            }
            
            success?(newUser)
        }, failure: failure)
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
            getApplications(success: appsUpdateCallback, failure: nil)
        }
    }
    
    static func getApplications(success: (() -> Void)?,
                                failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadApplicationsForJob(jobId: nil, status: nil, shortlisted: false, success: { (data) in
            
            applications = data as! [Application]
            getNewMessageCount()
            success?()
            
        }, failure: failure)
    }
    
    static func getApplication(_ id: NSNumber, success: ((Application) -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadApplicationWithId(id: id, success: { (data) in
            let newApplication = data as! Application
            var isNew = true
            for (index, application) in applications.enumerated() {
                if application.id == newApplication.id {
                    applications[index] = newApplication
                    isNew = false
                    break
                }
            }
            
            if isNew {
                applications.insert(newApplication, at: 0)
            }
            
            getNewMessageCount()
            success?(newApplication)
        }, failure: failure)
    }
    
}
