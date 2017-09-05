//
//  AppData.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class AppData: NSObject {

    // const
    
    static let productVersion = false

    static let greenColor = UIColor(red: 0/256.0, green: 187/256.0, blue: 168/256.0, alpha: 1)
    static let yellowColor = UIColor(red: 256/256.0, green: 147/256.0, blue: 0/256.0, alpha: 1)
    static let greyColor = UIColor(red: 214/256.0, green: 214/256.0, blue: 214/256.0, alpha: 1)
    static let greyBorderColor = UIColor(red: 204/256.0, green: 204/256.0, blue: 204/256.0, alpha: 1)
    static let imageBGColor = UIColor(red: 235/256.0, green: 235/256.0, blue: 235/256.0, alpha: 1)
    static let navColor = UIColor(red: 35/256.0, green: 35/256.0, blue: 35/256.0, alpha: 1)

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
    static var hours: NSArray!
    static var contracts: NSArray!
    static var sexes: NSArray!
    static var nationalities: NSArray!
    static var sectors: NSArray!
    static var jobStatuses: NSArray!
    static var applicationStatuses: NSArray!
    static var roles: NSArray!
    
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
    }

    static func loadData(success: (() -> Void)!,
                         failure: ((String?, NSDictionary?) -> Void)!) {

        var failed = false

        API.shared().loadHours(success: { (data) in
            hours = data
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
            contracts = data
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
            sexes = data
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
            nationalities = data
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
            sectors = data
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
            jobStatuses = data
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
            applicationStatuses = data
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
            roles = data
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
                initialTokens != nil
    }

    static func getSex(_ id: NSNumber!) -> Sex! {
        if id != nil {
            for sex in sexes as! [Sex] {
                if sex.id == id {
                    return sex
                }
            }
        }
        return nil
    }

    static func getSexByName(_ name: String!) -> Sex! {
        if name != nil {
            for sex in sexes as! [Sex] {
                if sex.name == name {
                    return sex
                }
            }
        }
        return nil
    }

    static func getHours(_ id: NSNumber!) -> Hours! {
        if id != nil {
            for hours in AppData.hours as! [Hours] {
                if hours.id == id {
                    return hours
                }
            }
        }
        return nil
    }

    static func getHoursByName(_ name: String!) -> Hours! {
        if name != nil {
            for hours in AppData.hours as! [Hours] {
                if hours.name == name {
                    return hours
                }
            }
        }
        return nil
    }

    static func getContract(_ id: NSNumber!) -> Contract! {
        if id != nil {
            for contract in contracts as! [Contract] {
                if contract.id == id {
                    return contract
                }
            }
        }
        return nil
    }

    static func getContractByName(_ name: String!) -> Contract! {
        if name != nil {
            for contract in contracts as! [Contract] {
                if contract.name == name {
                    return contract
                }
            }
        }
        return nil
    }
    
    static func getJobStatusByName(_ name: String!) -> JobStatus! {
        if name != nil {
            for status in jobStatuses as! [JobStatus] {
                if status.name == name {
                    return status
                }
            }
        }
        return nil
    }

    static func getApplicationStatus(_ id: NSNumber!) -> ApplicationStatus! {
        if id != nil {
            for status in applicationStatuses as! [ApplicationStatus] {
                if status.id == id {
                    return status
                }
            }
        }
        return nil
    }

    static func getApplicationStatusByName(_ name: String!) -> ApplicationStatus! {
        if name != nil {
            for status in applicationStatuses as! [ApplicationStatus] {
                if status.name == name {
                    return status
                }
            }
        }
        return nil
    }

    static func getRole(_ id: NSNumber!) -> Role! {
        if id != nil {
            for role in roles as! [Role] {
                if role.id == id {
                    return role
                }
            }
        }
        return nil
    }

    static func getRoleByName(_ name: String!) -> Role! {
        if name != nil {
            for role in roles as! [Role] {
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

}
