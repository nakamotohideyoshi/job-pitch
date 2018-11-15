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
    
    static var apiRoot = URL(string: "https://app.myjobpitch.com")!
    
    static var instance: API!
    static func shared() -> API {
        if instance == nil {
            instance = API()
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
        let cookies = cookieStorage.cookies(for: API.apiRoot)!
        for cookie in cookies {
            cookieStorage.deleteCookie(cookie)
        }
    }
    
    private func getError(_ error: Error?) -> Any {
        
        let nsError = error! as NSError

        if let localizedMessage = nsError.userInfo[NSLocalizedDescriptionKey] as! String? {
            if localizedMessage != "<null>" {
                return localizedMessage
            }
        }
        
        if let array = nsError.userInfo[RKObjectMapperErrorObjectsKey] as? NSArray {
            let rkError = array.firstObject as! RKErrorMessage
            if let errorMessage = rkError.errorMessage {
                return errorMessage
            }
            
            let userInfo = rkError.userInfo as! [String: Any]
            if userInfo["NO_TOKENS"] != nil {
                return "You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page."
            }
            
            for (_, value) in userInfo {
                if (value as? String) == "Invalid token." {
                    UserDefaults.standard.removeObject(forKey: "token")
                    clearToken()
                    SideMenuController.pushController(id: "log_out")
                    return -1
                }
            }
            
            return userInfo
        }
        
        return "Connection Error: Please check your internet connection"
    }

    
    // ================= Method =====================

    private func getObjects(_ path: String, complete: (([Any]?, Any?) -> Void)!) {
        clearCookies()
        manager.getObjectsAtPath(path, parameters: nil, success: { (_, mappingResult) in
            complete(mappingResult?.array(), nil)
        }) { (_, error) in
            complete(nil, self.getError(error))
        }
    }

    private func getObject(_ path: String, complete: ((Any?, Any?) -> Void)!) {
        clearCookies()
        manager.getObjectsAtPath(path, parameters: nil, success: { (_, mappingResult) in
            complete(mappingResult?.firstObject, nil)
        }) { (_, error) in
            complete(nil, self.getError(error))
        }
    }

    private func postObject(_ path: String, object: NSObject!, complete: ((Any?, Any?) -> Void)!) {
        clearCookies()
        manager.post(object, path: path, parameters: nil, success: { (_, mappingResult) in
            complete(mappingResult?.firstObject, nil)
        }) { (_, error) in
            complete(nil, self.getError(error))
        }
    }

    private func putObject(_ path: String, object: NSObject!, complete: ((Any?, Any?) -> Void)!) {
        clearCookies()
        manager.put(object, path: path, parameters: nil, success: { (_, mappingResult) in
            complete(mappingResult?.firstObject, nil)
        }) { (_, error) in
            complete(nil, self.getError(error))
        }
    }

    private func deleteObject(_ path: String, complete: ((Any?) -> Void)!) {
        clearCookies()
        manager.delete(nil, path: path, parameters: nil, success: { (_, _) in
            complete(nil)
        }) { (_, error) in
            complete(self.getError(error))
        }
    }

    
    // ================= Authorization =====================

    func setToken(_ token: String) {
        self.token = token
        manager.httpClient.setDefaultHeader("Authorization", value: "Token " + token)
    }
    
    func getToken() -> String {
        return self.token
    }

    func clearToken() {
        self.token = nil
        manager.httpClient.clearAuthorizationHeader()
    }
    
    func isLogin() -> Bool {
        return self.token != nil
    }

    func register(_ request: RegisterRequest, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api-rest-auth/registration/", object: request,  complete: complete)
    }

    func login(_ request: LoginRequest, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api-rest-auth/login/", object: request, complete: complete)
    }

    func resetPassword(_ request: PasswordResetRequest, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api-rest-auth/password/reset/", object: request, complete: complete)
    }

    func changePassword(_ request: PasswordChangeRequest, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api-rest-auth/password/change/", object: request, complete: complete)
    }

    func getUser(complete: ((Any?, Any?) -> Void)!) {
        getObject("/api-rest-auth/user/", complete: complete)
    }

    
    // ================= Data =====================
    
    func loadDepreactions(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/deprecation/", complete: complete)
    }

    func loadInitialTokens(complete: ((Any?, Any?) -> Void)!) {
        getObject("/api/initial-tokens/", complete: complete)
    }
    
    func loadHours(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/hours/", complete: complete)
    }

    func loadContracts(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/contracts/", complete: complete)
    }

    func loadSexes(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/sexes/", complete: complete)
    }

    func loadNationalities(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/nationalities/", complete: complete)
    }

    func loadSectors(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/sectors/", complete: complete)
    }

    func loadJobStatuses(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/job-statuses/", complete: complete)
    }

    func loadApplicationStatuses(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/application-statuses/", complete: complete)
    }

    func loadRoles(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/roles/", complete: complete)
    }
    
    
    // ================= Image =====================

    func uploadImage(_ image: UIImage, endpoint: String,
                     objectKey: String, objectId: NSNumber, order: NSNumber,
                     progress:((UInt, Int64, Int64) -> Void)!,
                     complete: ((Image?, Any?) -> Void)!) {

        let request = manager.multipartFormRequest(with: nil,
                                                   method: RKRequestMethod.POST,
                                                   path: String(format: "/api/%@/", endpoint),
                                                   parameters: nil) { (formData) in
                                                    formData?.appendPart(withFileData: UIImageJPEGRepresentation(image, 1),
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
                                                        complete(mappingResult?.firstObject as? Image, nil)
        }) { (_, error) in
            complete(nil, self.getError(error))
        }

        operation?.httpRequestOperation.setUploadProgressBlock(progress)
        manager.enqueue(operation)

    }

//    func deleteImage(_ id: NSNumber, endpoint: String, complete: ((Any?) -> Void)!) {
//        deleteObject(String(format: "/api/%@/%@/", endpoint, id), complete: complete)
//    }

    
    // ================= Pitch =====================

    func savePitch(_ pitch: Pitch, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api/pitches/", object: pitch, complete: complete)
    }

    func saveSpecificPitch(_ pitch: SpecificPitchForCreation, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api/application-pitches/", object: pitch, complete: complete)
    }
    
    func saveJobPitch(_ pitch: JobPitchForCreation, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api/job-videos/", object: pitch, complete: complete)
    }
    
    func getPitch(_ id: NSNumber, endpoint: String, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/%@/%@/", endpoint, id), complete: complete)
    }
    
    
    // ================= Profile =====================

    func saveJobProfile(_ profile: Profile, complete: ((Any?, Any?) -> Void)!) {
        if profile.id == nil {
            postObject("/api/job-profiles/", object: profile, complete: complete)
        } else {
            putObject(String(format: "/api/job-profiles/%@/", profile.id), object: profile, complete: complete)
        }
    }

    func loadJobProfileWithId(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/job-profiles/%@/", id), complete: complete)
    }

    
    // ================= Jobseeker =====================

    func saveJobSeeker(_ jobSeeker: JobSeeker, photo: UIImage!, cvdata: Data!,
                       progress:((UInt, Int64, Int64) -> Void)!, complete: ((JobSeeker?, Any?) -> Void)!) {
        clearCookies()

        let id = jobSeeker.id
        let method = id == nil ? RKRequestMethod.POST : RKRequestMethod.PATCH
        let path = id == nil ? "/api/job-seekers/" : String(format: "/api/job-seekers/%@/", id!)
        let request = manager.multipartFormRequest(with: jobSeeker,
                                                   method: method,
                                                   path: path,
                                                   parameters: nil,
                                                   constructingBodyWith: { (formData) in
                                                    if photo != nil {
                                                        formData?.appendPart(withFileData: UIImagePNGRepresentation(photo),
                                                                             name: "profile_image",
                                                                             fileName: "photo",
                                                                             mimeType: "image/png")
                                                    }
                                                    if cvdata != nil {
                                                        formData?.appendPart(withFileData: cvdata,
                                                                             name: "cv",
                                                                             fileName: "cv_file",
                                                                             mimeType: "application/octet-stream")
                                                    } else if jobSeeker.cv == nil {
                                                        formData?.appendPart(withForm: Data(), name: "cv")
                                                    }
        })
        
        let operation = manager.objectRequestOperation(with: request as URLRequest!, success: { (_, mappingResult) in
            complete((mappingResult?.firstObject as! JobSeeker), nil)
        }, failure: { (_, error) in
            complete(nil, self.getError(error))
        })
        
        operation?.httpRequestOperation.setUploadProgressBlock(progress)
        manager.enqueue(operation)        
    }

    func loadJobSeekerWithId(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/job-seekers/%@/", id), complete: complete)
    }

    func searchJobSeekersForJob(_ jobId: NSNumber, complete: (([Any]?, Any?) -> Void)!) {
        getObjects(String(format: "/api/job-seekers/?job=%@", jobId), complete: complete)
    }
    
    func ExclusionJobSeeker(_ object: ExclusionJobSeeker, complete: ((Any?, Any?) -> Void)!) {
        postObject(String(format: "/api/user-jobs/%@/exclude/", object.job), object: object, complete: complete)
    }
    
    // ================= Business =====================

    func saveBusiness(_ business: Business, complete: ((Any?, Any?) -> Void)!) {
        if business.id == nil {
            postObject("/api/user-businesses/", object: business, complete: complete)
        } else {
            putObject(String(format: "/api/user-businesses/%@/", business.id), object: business, complete: complete)
        }
    }

    func loadBusinesses(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/user-businesses/", complete: complete)
    }

    func loadBusiness(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/user-businesses/%@/", id), complete: complete)
    }

    func deleteBusiness(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/user-businesses/%@/", id), complete: complete)
    }


    // ================= Location =====================

    func saveLocation(_ location: Location, complete: ((Any?, Any?) -> Void)!) {
        if location.id == nil {
            postObject("/api/user-locations/", object: location, complete: complete)
        } else {
            putObject(String(format: "/api/user-locations/%@/", location.id), object: location, complete: complete)
        }
    }

    func loadLocationsForBusiness(_ businessId: NSNumber!, complete: (([Any]?, Any?) -> Void)!) {
        var path = "/api/user-locations/"
        if businessId != nil {
            path = String(format: "%@?business=%@", path, businessId)
        }
        getObjects(path, complete: complete)
    }
    
    func loadLocation(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/user-locations/%@/", id), complete: complete)
    }

    func deleteLocation(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/user-locations/%@/", id), complete: complete)
    }

    
    // ================= Job =====================

    func saveJob(_ job: Job, complete: ((Any?, Any?) -> Void)!) {
        if job.id == nil {
            postObject("/api/user-jobs/", object: job, complete: complete)
        } else {
            putObject(String(format: "/api/user-jobs/%@/", job.id), object: job, complete: complete)
        }
    }

    func loadJobsForLocation(_ locationId: NSNumber?, complete: (([Any]?, Any?) -> Void)!) {
        var path = "/api/user-jobs/"
        if locationId != nil {
            path = String(format: "%@?location=%@", path, locationId!)
        }
        getObjects(path, complete: complete)
    }

    func loadJob(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/user-jobs/%@/", id), complete: complete)
    }
    
    func loadJobWithId(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/jobs/%@/", id), complete: complete)
    }

    func deleteJob(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/user-jobs/%@/", id), complete: complete)
    }

    func searchJobs(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/jobs/", complete: complete)
    }

    // ================= Message =====================

    func sendMessage(_ message: MessageForCreation, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api/messages/", object: message, complete: complete)
    }
    
    func updateMessageStatus(_ update: MessageForUpdate, complete: ((Any?, Any?) -> Void)!) {
        putObject(String(format: "/api/messages/%@/", update.id), object: update, complete: complete)
    }

    // ================= Application =====================

    func createApplication(_ application: ApplicationForCreation0, complete: ((Any?, Any?) -> Void)!) {
        postObject("/api/applications/", object: application, complete: complete)
    }
    
    func createExternalApplication(_ application: ExternalApplicationForCreation, cvdata: Data!,
                                   progress:((UInt, Int64, Int64) -> Void)!, complete: ((ApplicationForCreation?, Any?) -> Void)!) {
        clearCookies()

        let request = manager.multipartFormRequest(with: application,
                                                   method: RKRequestMethod.POST,
                                                   path: "/api/applications/external/",
                                                   parameters: nil,
                                                   constructingBodyWith: { (formData) in
                                                    if cvdata != nil {
                                                        formData?.appendPart(withFileData: cvdata,
                                                                             name: "cv",
                                                                             fileName: "cv_file",
                                                                             mimeType: "application/octet-stream")
                                                    }
        })
        
        let operation = manager.objectRequestOperation(with: request as URLRequest!, success: { (_, mappingResult) in                                                      complete((mappingResult?.firstObject as! ApplicationForCreation), nil)
        }, failure: { (_, error) in
            complete(nil, self.getError(error))
        })
        
        operation?.httpRequestOperation.setUploadProgressBlock(progress)
        manager.enqueue(operation)
    }
    
    func updateApplicationStatus(_ data: ApplicationStatusUpdate, complete: ((Any?, Any?) -> Void)!) {
        putObject(String(format: "/api/applications/%@/", data.id), object: data, complete: complete)
    }

    func updateApplicationShortlist(_ request: ApplicationShortlistUpdate, complete: ((Any?, Any?) -> Void)!) {
        putObject(String(format: "/api/applications/%@/", request.id), object: request, complete: complete)
    }

    func loadApplicationWithId(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/applications/%@/", id), complete: complete)
    }

    func loadApplications(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/applications/", complete: complete)
    }

    func deleteApplication(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/applications/%@/", id), complete: complete)
    }
    
    
    // ================= BusinessUser =====================
    
    func loadBusinessUsers(_ businessId: NSNumber!, complete: (([Any]?, Any?) -> Void)!) {
        getObjects(String(format: "/api/user-businesses/%@/users/", businessId), complete: complete)
    }
    
    func createBusinessUser(businessId: NSNumber!, businessUser: BusinessUserForCreation, complete: ((Any?, Any?) -> Void)!) {
        postObject(String(format: "/api/user-businesses/%@/users/", businessId), object: businessUser, complete: complete)
    }
    
    func updateBusinessUser(businessId: NSNumber!, businessUserId: NSNumber!, businessUser: BusinessUserForUpdate, complete: ((Any?, Any?) -> Void)!) {
        putObject(String(format: "/api/user-businesses/%@/users/%@/", businessId, businessUserId), object: businessUser, complete: complete)
    }
    
    func getBusinessUser(businessId: NSNumber!, businessUserId: NSNumber!, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/user-businesses/%@/users/%@/", businessId, businessUserId), complete: complete)
    }
    
    func deleteBusinessUser(businessId: NSNumber!, businessUserId: NSNumber!, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/user-businesses/%@/users/%@/", businessId, businessUserId), complete: complete)
    }
    
    func reCreateBusinessUser(businessId: NSNumber!, businessUserId: NSNumber!, businessUser: BusinessUserForCreation!, complete: ((Any?, Any?) -> Void)!) {
        postObject(String(format: "/api/user-businesses/%@/users/%@/resend-invitation/", businessId, businessUserId), object: businessUser, complete: complete)
    }
    
    // ================== Interviews ============================
    
    func loadInterview(_ interviewId: NSNumber!, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/interviews/%@/", interviewId), complete: complete)
    }
    
    func saveInterview(_ interview: InterviewForSave, complete: ((Any?, Any?) -> Void)!) {
        if (interview.id == nil) {
            postObject("/api/interviews/", object: interview, complete: complete)
        } else {
            putObject(String(format: "/api/interviews/%@/", interview.id), object: interview, complete: complete)
        }
    }
    
    func changeInterview(_ interview: InterviewForSave, type: String, complete: ((Any?, Any?) -> Void)!) {
        postObject(String(format: "/api/interviews/%@/%@/", interview.id, type), object: interview, complete: complete)
    }
    
    func deleteInterview(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/interviews/%@/", id), complete: complete)
    }
    
    // ================== HR ============================
    
    func loadHRJobs(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/hr/jobs/", complete: complete)
    }
    
    func saveHRJob(_ job: HRJob, complete: ((Any?, Any?) -> Void)!) {
        if job.id == nil {
            postObject("/api/hr/jobs/", object: job, complete: complete)
        } else {
            putObject(String(format: "/api/hr/jobs/%@/", job.id), object: job, complete: complete)
        }
    }
    
    func deleteHRJob(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/hr/jobs/%@/", id), complete: complete)
    }
    
    func loadHREmployees(complete: (([Any]?, Any?) -> Void)!) {
        getObjects("/api/hr/employees/", complete: complete)
    }
    
    func saveHREmployee(_ employee: HREmployee, photo: UIImage!, progress:((UInt, Int64, Int64) -> Void)!, complete: ((HREmployee?, Any?) -> Void)!) {
        clearCookies()
        
        let id = employee.id
        let method = id == nil ? RKRequestMethod.POST : RKRequestMethod.PATCH
        let path = id == nil ? "/api/hr/employees/" : String(format: "/api/hr/employees/%@/", id!)
        let request = manager.multipartFormRequest(with: employee,
                                                   method: method,
                                                   path: path,
                                                   parameters: nil,
                                                   constructingBodyWith: { (formData) in
                                                    if photo != nil {
                                                        formData?.appendPart(withFileData: UIImagePNGRepresentation(photo),
                                                                             name: "profile_image",
                                                                             fileName: "photo",
                                                                             mimeType: "image/png")
                                                    }
                                      
        })
        
        let operation = manager.objectRequestOperation(with: request as URLRequest!, success: { (_, mappingResult) in
            complete((mappingResult?.firstObject as! HREmployee), nil)
        }, failure: { (_, error) in
            complete(nil, self.getError(error))
        })
        
        operation?.httpRequestOperation.setUploadProgressBlock(progress)
        manager.enqueue(operation)
    }
    
    func deleteHREmployee(_ id: NSNumber, complete: ((Any?) -> Void)!) {
        deleteObject(String(format: "/api/hr/employees/%@/", id), complete: complete)
    }
    
    // ================== Employee ============================
    
    func loadEmployee(_ id: NSNumber, complete: ((Any?, Any?) -> Void)!) {
        getObject(String(format: "/api/employee/employees/%@/", id), complete: complete)
    }
    
}
