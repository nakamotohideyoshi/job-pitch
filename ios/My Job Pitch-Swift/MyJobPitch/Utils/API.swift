//
//  API.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation
import RestKit

class API: NSObject {

    private static var instance: API!
    static func shared() -> API {
        if instance == nil {
            instance = API()
            _ = APIConfigure()
        }
        return instance
    }

    private var manager: RKObjectManager!

    private var token: String!

    override init() {
        _ = APIConfigure()
        manager = RKObjectManager.shared()
    }

    private func clearCookies() {
        let cookieStorage = HTTPCookieStorage.shared
        let cookies = cookieStorage.cookies(for: AppData.apiRoot)!
        for cookie in cookies {
            cookieStorage.deleteCookie(cookie)
        }
    }

    private func failureWithError(_ error: Error?,
                                  failure: ((String?, NSDictionary?) -> Void)!) {

        let nsError = error as! NSError

        var message: String?
        if let localizedMessage = nsError.userInfo[NSLocalizedDescriptionKey] as! String? {
            if localizedMessage != "<null>" {
                message = localizedMessage
            }
        }

        var userInfo: NSDictionary?
        if let array = nsError.userInfo[RKObjectMapperErrorObjectsKey] as? NSArray {
            let errorMessage = array.firstObject as! RKErrorMessage
            userInfo = errorMessage.userInfo as NSDictionary?
        }

        failure(message, userInfo)
    }


    // ================= Method =====================

    private func getObjects(_ path: String,
                            success: ((NSArray) -> Void)!,
                            failure: ((String?, NSDictionary?) -> Void)!) {
        clearCookies()

        manager.getObjectsAtPath(path,
                                 parameters: nil,
                                 success: { (_, mappingResult) in
                                    let array = NSArray(array: (mappingResult?.array())!)
                                    success(array)
        }) { (_, error) in
            self.failureWithError(error, failure: failure)
        }
    }

    private func getObject(_ path: String,
                           success: ((NSObject) -> Void)!,
                           failure: ((String?, NSDictionary?) -> Void)!) {
        clearCookies()

        manager.getObjectsAtPath(path,
                                 parameters: nil,
                                 success: { (_, mappingResult) in
                                    success(mappingResult?.firstObject as! NSObject)
        }) { (_, error) in
            self.failureWithError(error, failure: failure)
        }
    }

    private func postObject(_ path: String,
                            request: NSObject!,
                            success: ((NSObject?) -> Void)!,
                            failure: ((String?, NSDictionary?) -> Void)!) {
        clearCookies()

        manager.post(request,
                     path: path,
                     parameters: nil,
                     success: { (_, mappingResult) in
                        success(mappingResult?.firstObject as? NSObject)
        }) { (_, error) in
            self.failureWithError(error, failure: failure)
        }
    }

    private func putObject(_ path: String,
                            request: NSObject!,
                            success: ((NSObject?) -> Void)!,
                            failure: ((String?, NSDictionary?) -> Void)!) {
        clearCookies()

        manager.put(request,
                    path: path,
                    parameters: nil,
                    success: { (_, mappingResult) in
                        success(mappingResult?.firstObject as? NSObject)
        }) { (_, error) in
            self.failureWithError(error, failure: failure)
        }
    }

    private func deleteObject(_ path: String,
                           success: (() -> Void)!,
                           failure: ((String?, NSDictionary?) -> Void)!) {
        clearCookies()

        manager.delete(nil,
                       path: path,
                       parameters: nil,
                       success: { (_, _) in
                        success()
        }) { (_, error) in
            self.failureWithError(error, failure: failure)
        }
    }


    // ================= Authorization =====================

    func setToken(_ token: String) {
        self.token = token
        manager.httpClient.setDefaultHeader("Authorization", value: "Token " + token)
    }

    func clearToken() {
        self.token = nil
        manager.httpClient.clearAuthorizationHeader()
    }
    
    func isLogin() -> Bool {
        return self.token != nil
    }

    func register(email: String, password: String,
                  success: ((NSObject?) -> Void)!,
                  failure: ((String?, NSDictionary?) -> Void)!) {

        let request = RegisterRequest()
        request.email = email
        request.password1 = password
        request.password2 = password

        postObject("/api-rest-auth/registration/", request: request, success: success, failure: failure)
    }

    func login(email: String, password: String,
               success: ((NSObject?) -> Void)!,
               failure: ((String?, NSDictionary?) -> Void)!) {

        let request = LoginRequest()
        request.email = email
        request.password = password

        postObject("/api-rest-auth/login/", request: request, success: success, failure: failure)
    }

    func resetPassword(email: String,
                       success: ((NSObject?) -> Void)!,
                       failure: ((String?, NSDictionary?) -> Void)!) {

        let request = PasswordResetRequest()
        request.email = email

        postObject("/api-rest-auth/password/reset/", request: request, success: success, failure: failure)
    }

    func changePassword(password1: String, password2: String,
                        success: ((NSObject?) -> Void)!,
                        failure: ((String?, NSDictionary?) -> Void)!) {

        let request = PasswordChangeRequest()
        request.password1 = password1
        request.password2 = password2

        postObject("/api-rest-auth/password/change/", request: request, success: success, failure: failure)
    }

    func getUser(success: ((NSObject) -> Void)!,
                 failure: ((String?, NSDictionary?) -> Void)!) {
        getObject("/api-rest-auth/user/", success: success, failure: failure)
    }


    // ================= Data =====================

    func loadHours(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/hours/", success: success, failure: failure)
    }

    func loadContracts(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/contracts/", success: success, failure: failure)
    }

    func loadSexes(success: ((NSArray) -> Void)!,
                       failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/sexes/", success: success, failure: failure)
    }

    func loadNationalities(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/nationalities/", success: success, failure: failure)
    }

    func loadSectors(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/sectors/", success: success, failure: failure)
    }

    func loadJobStatuses(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/job-statuses/", success: success, failure: failure)
    }

    func loadApplicationStatuses(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/application-statuses/", success: success, failure: failure)
    }

    func loadRoles(success: ((NSArray) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/roles/", success: success, failure: failure)
    }


    // ================= Image =====================

    func uploadImage(image: UIImage, endpoint: String,
                     objectKey: String, objectId: NSNumber, order: NSNumber,
                     progress:((UInt, Int64, Int64) -> Void)!,
                     success: ((Image) -> Void)!,
                     failure: ((String?, NSDictionary?) -> Void)!) {

        let request = manager.multipartFormRequest(with: nil,
                                                   method: RKRequestMethod.POST,
                                                   path: String(format: "/api/%@/", endpoint),
                                                   parameters: nil) { (formData) in
                                                    formData?.appendPart(withFileData: UIImagePNGRepresentation(image),
                                                                         name: "image",
                                                                         fileName: "photo.png",
                                                                         mimeType: "image/png")
                                                    formData?.appendPart(withForm: order.stringValue.data(using: .utf8),
                                                                         name: "order")
                                                    formData?.appendPart(withForm: objectId.stringValue.data(using: .utf8),
                                                                         name: objectKey)
        }

        let operation = manager.objectRequestOperation(with: request as URLRequest!,
                                                       success: { (_, mappingResult) in
                                                        success(mappingResult?.firstObject as! Image)
        }) { (_, error) in
            self.failureWithError(error, failure: failure)
        }

        operation?.httpRequestOperation.setUploadProgressBlock(progress)
        manager.enqueue(operation)

    }

    func deleteImage(id: NSNumber,
                     endpoint: String,
                     success: (() -> Void)!,
                     failure: ((String?, NSDictionary?) -> Void)!) {
        deleteObject(String(format: "/api/%@/%@/", endpoint, id),
                     success: success,
                     failure: failure)
    }


    // ================= Pitch =====================

    func savePitch(pitch: Pitch,
                   success: ((NSObject?) -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        postObject("/api/pitches/", request: pitch,
                   success: success,
                   failure: failure)
    }

    func getPitch(id: NSNumber,
                  success: ((NSObject) -> Void)!,
                  failure: ((String?, NSDictionary?) -> Void)!) {
        getObject(String(format: "/api/pitches/%@/", id), success: success, failure: failure)
    }


    // ================= Profile =====================

    func saveJobProfile(profile: Profile,
                        success: ((NSObject?) -> Void)!,
                        failure: ((String?, NSDictionary?) -> Void)!) {
        if profile.id == nil {
            postObject("/api/job-profiles/", request: profile, success: success, failure: failure)
        } else {
            putObject(String(format: "/api/job-profiles/%@/", profile.id),
                      request: profile, success: success, failure: failure)
        }
    }

    func loadJobProfileWithId(id: NSNumber,
                              success: ((NSObject) -> Void)!,
                              failure: ((String?, NSDictionary?) -> Void)!) {
        getObject(String(format: "/api/job-profiles/%@/", id),
                  success: success, failure: failure)
    }

    func searchJobsWithExclusions(exclusions: NSArray!,
                                  success: ((NSArray) -> Void)!,
                                  failure: ((String?, NSDictionary?) -> Void)!) {

        var path = "/api/jobs/"
        if exclusions != nil {
            path = String(format: "%@?exclude=%@", path, exclusions.componentsJoined(by: ","))
        }

        getObjects(path, success: success, failure: failure)
    }


    // ================= Job Seeker =====================

    func saveJobSeeker(jobSeeker: JobSeeker, cvdata: Data!,
                       success: ((NSObject?) -> Void)!,
                       failure: ((String?, NSDictionary?) -> Void)!) {
        clearCookies()

        if cvdata == nil {
            jobSeeker.cv = nil
        }
        
        let method = jobSeeker.id == nil ? RKRequestMethod.POST : RKRequestMethod.PUT
        let path = jobSeeker.id == nil ? "/api/job-seekers/" : String(format: "/api/job-seekers/%@/", jobSeeker.id)
        let request = manager.multipartFormRequest(with: jobSeeker,
                                                   method: method,
                                                   path: path,
                                                   parameters: nil,
                                                   constructingBodyWith: { (formData) in
                                                    if cvdata != nil {
                                                        formData?.appendPart(withFileData: cvdata,
                                                                             name: "cv",
                                                                             fileName: jobSeeker.cv,
                                                                             mimeType: "application/octet-stream")
                                                    }
        })
        
        let operation = manager.objectRequestOperation(with: request as URLRequest!,
                                                       success: { (_, mappingResult) in
                                                        success(mappingResult?.firstObject as! JobSeeker)
        }, failure: { (_, error) in
            self.failureWithError(error, failure: failure)
        })
        
        manager.enqueue(operation)
    }

    func loadJobSeekerWithId(id: NSNumber,
                             success: ((NSObject) -> Void)!,
                             failure: ((String?, NSDictionary?) -> Void)!) {
        getObject(String(format: "/api/job-seekers/%@/", id),
                  success: success, failure: failure)
    }

    func searchJobSeekersForJob(jobId: NSNumber,
                                exclusions: NSArray!,
                                success: ((NSArray) -> Void)!,
                                failure: ((String?, NSDictionary?) -> Void)!) {

        var path = String(format: "/api/job-seekers/?job=%@", jobId)
        if exclusions != nil {
            path = String(format: "%@&exclude=%@", path, exclusions.componentsJoined(by: ","))
        }

        getObjects(path, success: success, failure: failure)
    }


    // ================= Business =====================

    func saveBusiness(business: Business,
                    success: ((NSObject?) -> Void)!,
                    failure: ((String?, NSDictionary?) -> Void)!) {

        if business.id == nil {
            postObject("/api/user-businesses/", request: business, success: success, failure: failure)
        } else {
            putObject(String(format: "/api/user-businesses/%@/", business.id),
                      request: business, success: success, failure: failure)
        }
    }

    func loadBusinesses(success: ((NSArray) -> Void)!,
                        failure: ((String?, NSDictionary?) -> Void)!) {
        getObjects("/api/user-businesses/", success: success, failure: failure)
    }

    func loadBusiness(id: NSNumber,
                      success: ((NSObject) -> Void)!,
                      failure: ((String?, NSDictionary?) -> Void)!) {
        getObject(String(format: "/api/user-businesses/%@/", id),
                  success: success, failure: failure)
    }

    func deleteBusiness(id: NSNumber,
                        success: (() -> Void)!,
                        failure: ((String?, NSDictionary?) -> Void)!) {
        deleteObject(String(format: "/api/user-businesses/%@/", id),
                     success: success, failure: failure)
    }


    // ================= Location =====================

    func saveLocation(location: Location,
                      success: ((NSObject?) -> Void)!,
                      failure: ((String?, NSDictionary?) -> Void)!) {
        if location.id == nil {
            postObject("/api/user-locations/",
                       request: location,
                       success: success,
                       failure: failure)
        } else {
            putObject(String(format: "/api/user-locations/%@/", location.id),
                      request: location, success: success, failure: failure)
        }
    }

    func loadLocationsForBusiness(businessId: NSNumber!,
                                  success: ((NSArray) -> Void)!,
                                  failure: ((String?, NSDictionary?) -> Void)!) {
        var path = "/api/user-locations/"
        if businessId != nil {
            path = String(format: "%@?business=%@", path, businessId)
        }
        getObjects(String(format: path, businessId),
                   success: success,
                   failure: failure)
    }

    func deleteLocation(id: NSNumber,
                        success: (() -> Void)!,
                        failure: ((String?, NSDictionary?) -> Void)!) {
        deleteObject(String(format: "/api/user-locations/%@/", id),
                     success: success,
                     failure: failure)
    }


    // ================= Job =====================

    func saveJob(job: Job,
                 success: ((NSObject?) -> Void)!,
                 failure: ((String?, NSDictionary?) -> Void)!) {
        if job.id == nil {
            postObject("/api/user-jobs/", request: job, success: success, failure: failure)
        } else {
            putObject(String(format: "/api/user-jobs/%@/", job.id),
                      request: job,
                      success: success,
                      failure: failure)
        }

    }

//    func loadJobs(success: ((NSArray) -> Void)!,
//                  failure: ((String?, NSDictionary?) -> Void)!) {
//        getObjects("/api/user-jobs/", success: success, failure: failure)
//    }

    func loadJobsForLocation(locationId: NSNumber?,
                             success: ((NSArray) -> Void)!,
                             failure: ((String?, NSDictionary?) -> Void)!) {
        var path = "/api/user-jobs/"
        if locationId != nil {
            path = String(format: "%@?location=%@", path, locationId!)
        }
        getObjects(path, success: success, failure: failure)
    }

    func loadJobWithId(id: NSNumber,
                       success: ((NSObject) -> Void)!,
                       failure: ((String?, NSDictionary?) -> Void)!) {
        getObject(String(format: "/api/user-jobs/%@/", id),
                  success: success, failure: failure)
    }

    func deleteJob(id: NSNumber,
                   success: (() -> Void)!,
                   failure: ((String?, NSDictionary?) -> Void)!) {
        deleteObject(String(format: "/api/user-jobs/%@/", id),
                     success: success,
                     failure: failure)
    }


    // ================= Message =====================

    func sendMessage(message: MessageForCreation,
                     success: ((NSObject?) -> Void)!,
                     failure: ((String?, NSDictionary?) -> Void)!) {
        postObject("/api/messages/", request: message,
                   success: success, failure: failure)
    }


    // ================= Application =====================

    func createApplication(application: ApplicationForCreation,
                           success: ((NSObject?) -> Void)!,
                           failure: ((String?, NSDictionary?) -> Void)!) {
        postObject("/api/applications/", request: application,
                   success: success, failure: failure)
    }

    func updateApplicationStatus(update: ApplicationStatusUpdate,
                                 success: ((NSObject?) -> Void)!,
                                 failure: ((String?, NSDictionary?) -> Void)!) {
        putObject(String(format: "/api/applications/%@/", update.id),
                  request: update, success: success, failure: failure)
    }

    func updateApplicationShortlist(update: ApplicationShortlistUpdate,
                                    success: ((NSObject?) -> Void)!,
                                    failure: ((String?, NSDictionary?) -> Void)!) {
        putObject(String(format: "/api/applications/%@/", update.id),
                  request: update, success: success, failure: failure)
    }

//    func loadApplicationWithId(id: NSNumber,
//                               success: ((NSObject) -> Void)!,
//                               failure: ((String?, NSDictionary?) -> Void)!) {
//        getObject(String(format: "/api/applications/%@/", id),
//                  success: success, failure: failure)
//    }

    func loadApplicationsForJob(jobId: NSNumber!,
                                status: NSNumber!,
                                shortlisted: Bool,
                                success: ((NSArray) -> Void)!,
                                failure: ((String?, NSDictionary?) -> Void)!) {
        
        var path = "/api/applications/"
        var link = "?"
        if jobId != nil {
            path = String(format: "%@%@job=%@", path, link, jobId)
            link = "@"
        }
        if status != nil {
            path = String(format: "%@%@status=%@", path, link, status)
            link = "@"
        }
        if shortlisted {
            path = String(format: "%@%@shortlisted=1", path, link)
        }

        getObjects(path, success: success, failure: failure)
    }

    func deleteApplication(id: NSNumber,
                           success: (() -> Void)!,
                           failure: ((String?, NSDictionary?) -> Void)!) {
        deleteObject(String(format: "/api/applications/%@/", id),
                     success: success, failure: failure)
    }

}
