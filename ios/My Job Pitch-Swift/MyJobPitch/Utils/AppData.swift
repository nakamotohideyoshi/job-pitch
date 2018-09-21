
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
    static let greyColor = UIColor(red: 214/255.0, green: 214/255.0, blue: 214/255.0, alpha: 1)
    static let lightGreyColor = UIColor(red: 235/255.0, green: 235/255.0, blue: 235/255.0, alpha: 1)
    static let darkColor = UIColor(red: 51/255.0, green: 51/255.0, blue: 51/255.0, alpha: 1)
    
    static let cornerRadius: CGFloat = 6
    
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
    
    static var existProfile = false
        
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
    
    static func clearData() {
        existProfile = false
        
        user = nil
        hours = nil
        contracts = nil
        sexes = nil
        nationalities = nil
        sectors = nil
        jobStatuses = nil
        applicationStatuses = nil
        roles = nil
        
        initialTokens = nil
        
        applications = nil
        stopTimer()
    }
    
    static func loadData(success: (() -> Void)!,
                         failure: ((String?, NSDictionary?) -> Void)!) {
        
        var failed = false
        
        API.shared().loadHours(success: { (data) in
            hours = data as! [Hours]
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadContracts(success: { (data) in
            contracts = data as! [Contract]
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadSexes(success: { (data) in
            sexes = data as! [Sex]
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadNationalities(success: { (data) in
            nationalities = data as! [Nationality]
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadSectors(success: { (data) in
            sectors = data as! [Sector]
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadJobStatuses(success: { (data) in
            jobStatuses = data as! [JobStatus]
            JobStatus.JOB_STATUS_OPEN_ID = getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id
            JobStatus.JOB_STATUS_CLOSED_ID = getJobStatusByName(JobStatus.JOB_STATUS_CLOSED).id
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadApplicationStatuses(success: { (data) in
            applicationStatuses = data as! [ApplicationStatus]
            ApplicationStatus.APPLICATION_CREATED_ID = getApplicationStatusByName(ApplicationStatus.APPLICATION_CREATED).id
            ApplicationStatus.APPLICATION_ESTABLISHED_ID = getApplicationStatusByName(ApplicationStatus.APPLICATION_ESTABLISHED).id
            ApplicationStatus.APPLICATION_DELETED_ID = getApplicationStatusByName(ApplicationStatus.APPLICATION_DELETED).id
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadRoles(success: { (data) in
            roles = data as! [Role]
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadInitialTokens(success: { (data) in
            initialTokens = data as! InitialTokens
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        API.shared().loadInitialTokens(success: { (data) in
            initialTokens = data as! InitialTokens
            if isDataLoaded() {
                success()
            }
        }) { (message, errors) in
            if !failed {
                failed = true
                failure(message, errors)
            }
        }
        
        getApplications(success: {
            if isDataLoaded() {
                success()
                startTimer()
            }
        }, failure: failure)
        
        updateJobSeeker(success: {
            if isDataLoaded() {
                success()
            }
        }, failure: failure)
    }
    
    private static func isDataLoaded() -> Bool {
        return  hours != nil &&
            contracts != nil &&
            sexes != nil &&
            nationalities != nil &&
            sectors != nil &&
            jobStatuses != nil &&
            applicationStatuses != nil &&
            roles != nil &&
            initialTokens != nil &&
            applications != nil &&
            user.isRecruiter() || jobSeeker != nil
    }
    
    static func getSex(_ id: NSNumber!) -> Sex! {
        if id != nil {
            for sex in sexes as [Sex] {
                if sex.id == id {
                    return sex
                }
            }
        }
        return nil
    }
    
    static func getSexByName(_ name: String!) -> Sex! {
        if name != nil {
            for sex in sexes as [Sex] {
                if sex.name == name {
                    return sex
                }
            }
        }
        return nil
    }
    
    static func getHours(_ id: NSNumber!) -> Hours! {
        if id != nil {
            for hours in AppData.hours {
                if hours.id == id {
                    return hours
                }
            }
        }
        return nil
    }
    
    static func getHoursByName(_ name: String!) -> Hours! {
        if name != nil {
            for hours in AppData.hours {
                if hours.name == name {
                    return hours
                }
            }
        }
        return nil
    }
    
    static func getContract(_ id: NSNumber!) -> Contract! {
        if id != nil {
            for contract in contracts {
                if contract.id == id {
                    return contract
                }
            }
        }
        return nil
    }
    
    static func getContractByName(_ name: String!) -> Contract! {
        if name != nil {
            for contract in contracts as [Contract] {
                if contract.name == name {
                    return contract
                }
            }
        }
        return nil
    }
    
    static func getJobStatusByName(_ name: String!) -> JobStatus! {
        if name != nil {
            for status in jobStatuses as [JobStatus] {
                if status.name == name {
                    return status
                }
            }
        }
        return nil
    }
    
    static func getApplicationStatusByName(_ name: String!) -> ApplicationStatus! {
        if name != nil {
            for status in applicationStatuses as [ApplicationStatus] {
                if status.name == name {
                    return status
                }
            }
        }
        return nil
    }
    
    static func getRole(_ id: NSNumber!) -> Role! {
        if id != nil {
            for role in roles as [Role] {
                if role.id == id {
                    return role
                }
            }
        }
        return nil
    }
    
    static func getRoleByName(_ name: String!) -> Role! {
        if name != nil {
            for role in roles as [Role] {
                if role.name == name {
                    return role
                }
            }
        }
        return nil
    }
    
    static func getUserRole() -> Role! {
        if user.isJobSeeker() {
            return getRoleByName(Role.ROLE_JOB_SEEKER)
        }
        return getRoleByName(Role.ROLE_RECRUITER)
    }
    
    //================ applications =============
    
    static var jobSeeker: JobSeeker!
    
    static func updateJobSeeker(success: (() -> Void)?,
                                failure: ((String?, NSDictionary?) -> Void)?) {
        if AppData.user.jobSeeker != nil {
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                jobSeeker = data as! JobSeeker
                success?()
            }, failure: failure)
        }
    }

    //================ applications =============
    
    static let DEFAULT_REFRESH_TIME = 30
    static let MESSAGE_REFRESH_TIME = 5
    
    static var timer: Timer?
    static var time = 0
    static var appsRefreshTime = DEFAULT_REFRESH_TIME
    static var refreshCallback: (() -> Void)?
    
    static var newMessageCount = 0
    
    static var applications: [Application]!
    
    static func startTimer() {
        if timer == nil {
            time = 0
            timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(refreshApplications), userInfo: nil, repeats: true)
        }
    }
    
    static func stopTimer() {
        if timer != nil {
            timer?.invalidate()
            timer = nil
        }
    }
    
    static func refreshApplications() {
        time += 1
        if time >= appsRefreshTime {
            time = 0
            getApplications(success: refreshCallback, failure: nil)
        }
    }
    
    static func preprocessApplications() {
        newMessageCount = 0
        
        for application in applications {
            newMessageCount += application.getNewMessageCount()
        }
    }
    
    static func getApplications(success: (() -> Void)?,
                                failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadApplicationsForJob(jobId: nil, status: nil, shortlisted: false, success: { (data) in
            
            applications = data as! [Application]
            preprocessApplications()
            print("================= update applications ==============")
            success?()
            
        }, failure: failure)
    }
    
    static func updateApplication(_ id: NSNumber, success: ((Application) -> Void)?,
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
            
            preprocessApplications()
            success?(newApplication)
        }, failure: failure)
    }
    
    //================ businesses =============
    
    static var businesses: [Business]!
    
    static func getBusinesses(success: (() -> Void)?,
                              failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadBusinesses(success: { (data) in
            businesses = data as! [Business]
            success?()
        }, failure: failure)
    }
    
    static func updateBusiness(_ id: NSNumber, success: (() -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadBusiness(id: id, success: { (data) in
            var newBusiness: Business! = data as! Business
            
            for (index, business) in businesses.enumerated() {
                if business.id == newBusiness.id {
                    businesses[index] = newBusiness
                    newBusiness = nil
                    break
                }
            }
            
            if newBusiness != nil {
                businesses.insert(newBusiness, at: 0)
            }
            
            success?()
        }, failure: failure)
    }
    
    static func removeBusiness(businessId: NSNumber,
                               success: (() -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {
        for (index, business) in businesses.enumerated() {
            if business.id == businessId {
                businesses.remove(at: index)
                break
            }
        }
    }
    
    //================ locations =============
    
    static var locations: [Location]!
    
    static func getLocations(businessId: NSNumber,
                             success: (() -> Void)?,
                             failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadLocationsForBusiness(businessId: businessId, success: { (data) in
            locations = data as! [Location]
            success?()
        }, failure: failure)
    }
    
    static func updateLocation(_ id: NSNumber, success: (() -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadLocation(id: id, success: { (data) in
            var newLocation: Location! = data as! Location
            
            for (index, location) in locations.enumerated() {
                if location.id == newLocation.id {
                    locations[index] = newLocation
                    newLocation = nil
                    break
                }
            }
            
            if newLocation != nil {
                locations.insert(newLocation, at: 0)
            }
            
            success?()
        }, failure: failure)
    }
    
    static func removeLocation(locationId: NSNumber,
                               success: (() -> Void)?,
                               failure: ((String?, NSDictionary?) -> Void)?) {
        for (index, location) in locations.enumerated() {
            if location.id == locationId {
                locations.remove(at: index)
                break
            }
        }
    }
    
    //================ jobs =============
    
    static var jobs: [Job]!
    
    static func getJobs(locationId: NSNumber!,
                        success: (() -> Void)?,
                        failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadJobsForLocation(locationId: locationId, success: { (data) in
            jobs = data as! [Job]
            success?()
        }, failure: failure)
    }
    
    static func updateJob(_ id: NSNumber, success: (() -> Void)?,
                          failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadJob(id: id, success: { (data) in
            var newJob: Job! = data as! Job
            
            for (index, job) in jobs.enumerated() {
                if job.id == newJob.id {
                    jobs[index] = newJob
                    newJob = nil
                    break
                }
            }
            
            if newJob != nil {
                jobs.insert(newJob, at: 0)
            }
            
            success?()
        }, failure: failure)
    }
    
    static func removeJob(_ jobId: NSNumber) {
        for (index, job) in jobs.enumerated() {
            if job.id == jobId {
                jobs.remove(at: index)
                break
            }
        }
    }
    
    //================ business users =============
    
    static var businessUsers: [BusinessUser]!
    
    static func getBusinessUsers(businessId: NSNumber,
                         success: (() -> Void)?,
                         failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().loadBusinessUsers(businessId: businessId, success: { (data) in
            businessUsers = data as! [BusinessUser]
            success?()
        }, failure: failure)
    }
    
    static func updateBusinessUser(businessId: NSNumber,
                           userId: NSNumber,
                           success: (() -> Void)?,
                           failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().getBusinessUser(businessId: businessId, businessUserId: userId, success: { (data) in
            var newUser: BusinessUser! = data as! BusinessUser
            
            for (index, user) in businessUsers.enumerated() {
                if user.id == newUser.id {
                    businessUsers[index] = newUser
                    newUser = nil
                    break
                }
            }
            
            if newUser != nil {
                businessUsers.append(newUser)
            }
            
            success?()
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
    
    //================ serach jobs =============
    
    static var jsJobs: [Job]!
    
    static func searchJobs(success: (() -> Void)?,
                           failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().searchJobsWithExclusions(exclusions: [], success: { (data) in
            jsJobs = data as! [Job]
            success?()
        }, failure: failure)
    }
    
    static func removeJobForJS(_ jobId: NSNumber) {
        for (index, job) in jsJobs.enumerated() {
            if job.id == jobId {
                jsJobs.remove(at: index)
                break
            }
        }
    }
    
    //================ jobseekers =============
    
    static var rcJobseekers: [JobSeeker]!
    
    static func searchJobseekers(jobId: NSNumber,
                                 success: (() -> Void)?,
                                 failure: ((String?, NSDictionary?) -> Void)?) {
        API.shared().searchJobSeekersForJob(jobId: jobId, exclusions: [], success: { (data) in
            rcJobseekers = data as! [JobSeeker]
            success?()
        }, failure: failure)
    }
    
    static func removeJobseekerForRC(_ jobseekerId: NSNumber) {
        for (index, jobseeker) in rcJobseekers.enumerated() {
            if jobseeker.id == jobseekerId {
                rcJobseekers.remove(at: index)
                break
            }
        }
    }
    
}
