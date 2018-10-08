//
//  APIConfigure.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation
import RestKit

class APIConfigure: NSObject {

    var manager: RKObjectManager!

    override init() {

        super.init()

        let client = AFRKHTTPClient(baseURL: API.apiRoot)
        client?.setDefaultHeader("Accept", value: String(format: "application/json; version=%d", AppData.apiVersion))
 
        RKObjectManager.setShared(nil)
        manager = RKObjectManager.init(httpClient: client)!
        manager.requestSerializationMIMEType = RKMIMETypeJSON
        
        
        let emptyMapping = createResponseMappingForClass(NSObject.classForCoder(),
                                                         array: nil,
                                                         dictionary: nil,
                                                         relationships: nil)


        // ================= authorization =====================

        configureMapping(LoginRequest.classForCoder(),
                         requestArray: LoginRequest.mappingArray,
                         requestDictionary: nil,
                         requestRelationships: nil,
                         responseClass: AuthToken.classForCoder(),
                         responseArray: AuthToken.mappingArray,
                         responseDictionary: nil,
                         responseRelationships: nil,
                         path: "/api-rest-auth/login/",
                         method: .POST)

        configureMapping(RegisterRequest.classForCoder(),
                         requestArray: RegisterRequest.mappingArray,
                         requestDictionary: nil,
                         requestRelationships: nil,
                         responseClass: AuthToken.classForCoder(),
                         responseArray: AuthToken.mappingArray,
                         responseDictionary: nil,
                         responseRelationships: nil,
                         path: "/api-rest-auth/registration/",
                         method: .POST)
        
        configureRequestMapping(PasswordResetRequest.classForCoder(),
                                requestArray: PasswordResetRequest.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
        configureResponseMapping(emptyMapping,
                                 path: "/api-rest-auth/password/reset/",
                                 method: .POST)
        
        configureRequestMapping(PasswordChangeRequest.classForCoder(),
                                requestArray: nil,
                                requestDictionary: PasswordChangeRequest.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        configureResponseMapping(emptyMapping,
                                 path: "/api-rest-auth/password/change/",
                                 method: .POST)
        
        configureResponseMapping(User.classForCoder(),
                                 responseArray: User.mappingArray,
                                 responseDictionary: inverseDictionary(User.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api-rest-auth/user/",
                                 method: .GET)

        
        // ================= data =====================
        
        configureResponseMapping(Deprecation.classForCoder(),
                                 responseArray: Deprecation.mappingArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/deprecation/",
                                 method: .GET)

        configureResponseMapping(InitialTokens.classForCoder(),
                                 responseArray: InitialTokens.mappingArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/initial-tokens/",
                                 method: .GET)
        
        configureResponseMapping(Hours.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(Hours.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/hours/",
                                 method: .GET)

        configureResponseMapping(Contract.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(Contract.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/contracts/",
                                 method: .GET)

        configureResponseMapping(Sector.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(Sector.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/sectors/",
                                 method: .GET)

        configureResponseMapping(Sex.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(Sex.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/sexes/",
                                 method: .GET)

        configureResponseMapping(Nationality.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(Nationality.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/nationalities/",
                                 method: .GET)

        configureResponseMapping(JobStatus.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(JobStatus.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/job-statuses/",
                                 method: .GET)

        configureResponseMapping(ApplicationStatus.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: inverseDictionary(ApplicationStatus.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api/application-statuses/",
                                 method: .GET)

        configureResponseMapping(Role.classForCoder(),
                                 responseArray: MJPObjectWithName.mappingArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/roles/",
                                 method: .GET)


        // ================= Image =====================

        let imageMapping = createResponseMappingForClass(Image.classForCoder(),
                                                         array: Image.mappingArray,
                                                         dictionary: nil,
                                                         relationships: nil)

        configureResponseMapping(imageMapping,
                                 path: "/api/user-business-images/",
                                 method: .POST)

        configureResponseMapping(imageMapping,
                                 path: "/api/user-location-images/",
                                 method: .POST)

        configureResponseMapping(imageMapping,
                                 path: "/api/user-job-images/",
                                 method: .POST)

//        configureResponseMapping(emptyMapping,
//                                 path: "/api/user-business-images/:pk/",
//                                 method: .DELETE)
//
//        configureResponseMapping(emptyMapping,
//                                 path: "/api/user-location-images/:pk/",
//                                 method: .DELETE)
//
//        configureResponseMapping(emptyMapping,
//                                 path: "/api/user-job-images/:pk/",
//                                 method: .DELETE)


        // ================= Pitch =====================

        let pitchMapping = createResponseMappingForClass(Pitch.classForCoder(),
                                                         array: Pitch.mappingArray,
                                                         dictionary: nil,
                                                         relationships: nil)

        configureRequestMapping(Pitch.classForCoder(),
                                requestArray: nil,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
        
        configureRequestMapping(SpecificPitchForCreation.classForCoder(),
                                requestArray: nil,
                                requestDictionary: SpecificPitchForCreation.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        
        configureRequestMapping(JobPitchForCreation.classForCoder(),
                                requestArray: JobPitchForCreation.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
        
        configureResponseMapping(pitchMapping,
                                 path: "/api/pitches/",
                                 method: .POST)
        
        configureResponseMapping(pitchMapping,
                                 path: "/api/pitches/:pk/",
                                 method: .GET)
        
        configureResponseMapping(pitchMapping,
                                 path: "/api/application-pitches/",
                                 method: .POST)
        
        configureResponseMapping(pitchMapping,
                                  path: "/api/application-pitches/:pk/",
                                 method: .GET)
        
        configureResponseMapping(pitchMapping,
                                 path: "/api/job-videos/",
                                 method: .POST)
        
        configureResponseMapping(pitchMapping,
                                 path: "/api/job-videos/:pk/",
                                 method: .GET)
        
        
        // ================= Profile =====================
        
        let profileMapping = createResponseMappingForClass(Profile.classForCoder(),
                                                           array: Profile.mappingArray,
                                                           dictionary: inverseDictionary(Profile.mappingDictionary),
                                                           relationships: nil)
        
        configureRequestMapping(Profile.classForCoder(),
                                requestArray: Profile.mappingArray,
                                requestDictionary: Profile.mappingDictionary,
                                requestRelationships: nil,
                                method: [.POST, .PUT])
        
        configureResponseMapping(profileMapping,
                                 path: "/api/job-profiles/",
                                 method: .POST)
        
        configureResponseMapping(profileMapping,
                                 path: "/api/job-profiles/:pk/",
                                 method: [.PUT, .GET])
        
        
        // ================= Jobseeker =====================
        
        let jobSeekerRelationships = [ [ "source":          "pitches",
                                       "destination":     "pitches",
                                       "mapping":         pitchMapping ] ]
        
        let jobSeekerMapping = createResponseMappingForClass(JobSeeker.classForCoder(),
                                                             array: JobSeeker.mappingArray,
                                                             dictionary: inverseDictionary(JobSeeker.mappingDictionary),
                                                             relationships: inverseRelationships(jobSeekerRelationships))
        
        configureRequestMapping(JobSeeker.classForCoder(),
                                requestArray: JobSeeker.mappingReqArray,
                                requestDictionary: JobSeeker.mappingReqDictionary,
                                requestRelationships: nil,
                                method: [.POST, .PATCH])
        
        configureResponseMapping(jobSeekerMapping,
                                 path: "/api/job-seekers/",
                                 method: [.GET, .POST])
        
        configureResponseMapping(jobSeekerMapping,
                                 path: "/api/job-seekers/:pk/",
                                 method: [.GET, .PATCH])
        

        // ================= Business =====================

        let businessRelationships = [ [ "source":       "images",
                                        "destination":  "images",
                                        "mapping":      imageMapping ] ]

        let businessMapping = createResponseMappingForClass(Business.classForCoder(),
                                                            array: Business.mappingArray,
                                                            dictionary: nil,
                                                            relationships: inverseRelationships(businessRelationships))

        configureRequestMapping(Business.classForCoder(),
                                requestArray: Business.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: [.POST, .PUT])
        
        configureResponseMapping(businessMapping,
                                 path: "/api/user-businesses/",
                                 method: .any)
        
        configureResponseMapping(businessMapping,
                                 path: "/api/user-businesses/:pk/",
                                 method: .any)
        
        
        // ================= Location =====================

        let locationRelationships = [ [ "source": "businessData",
                                        "destination": "business_data",
                                        "mapping": businessMapping ],
                                      [ "source": "images",
                                        "destination": "images",
                                        "mapping": imageMapping ] ]

        let locationMapping = createResponseMappingForClass(Location.classForCoder(),
                                                            array: Location.mappingArray,
                                                            dictionary: inverseDictionary(Location.mappingDictionary),
                                                            relationships: inverseRelationships(locationRelationships))

        configureRequestMapping(Location.classForCoder(),
                                requestArray: Location.mappingArray,
                                requestDictionary: Location.mappingDictionary,
                                requestRelationships: nil,
                                method: [.POST, .PUT])
        
        configureResponseMapping(locationMapping,
                                 path: "/api/user-locations/",
                                 method: .any)
        
        configureResponseMapping(locationMapping,
                                 path: "/api/user-locations/:pk/",
                                 method: .any)
        
        
        // ================= Job =====================

        let jobRelationships = [ [ "source": "locationData",
                                   "destination": "location_data",
                                   "mapping": locationMapping ],
                                 [ "source": "images",
                                   "destination": "images",
                                   "mapping": imageMapping ],
                                 [ "source": "videos",
                                   "destination": "videos",
                                   "mapping": pitchMapping ] ]
        
        let jobMapping = createResponseMappingForClass(Job.classForCoder(),
                                                       array: Job.mappingArray,
                                                       dictionary: inverseDictionary(Job.mappingDictionary),
                                                       relationships: inverseRelationships(jobRelationships))

        configureRequestMapping(Job.classForCoder(),
                                requestArray: Job.mappingArray,
                                requestDictionary: Job.mappingDictionary,
                                requestRelationships: nil,
                                method: [.POST, .PUT])
        
        configureResponseMapping(jobMapping,
                                 path: "/api/user-jobs/",
                                 method: .any)
        
        configureResponseMapping(jobMapping,
                                 path: "/api/user-jobs/:pk/",
                                 method: .any)
        
        configureResponseMapping(jobMapping,
                                 path: "/api/jobs/",
                                 method: .GET)
        
        configureResponseMapping(jobMapping,
                                 path: "/api/jobs/:pk/",
                                 method: .GET)
        
        configureRequestMapping(ExclusionJobSeeker.classForCoder(),
                                requestArray: nil,
                                requestDictionary: ExclusionJobSeeker.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        
        configureResponseMapping(emptyMapping,
                                 path: "/api/user-jobs/:pk/exclude/",
                                 method: .POST)

        
        // ================= Message =====================

        let messageMapping = createResponseMappingForClass(Message.classForCoder(),
                                                           array: Message.mappingArray,
                                                           dictionary: inverseDictionary(Message.mappingDictionary),
                                                           relationships: nil)

        configureRequestMapping(MessageForCreation.classForCoder(),
                                requestArray: MessageForCreation.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
        
        configureRequestMapping(MessageForUpdate.classForCoder(),
                                requestArray: MessageForUpdate.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
        
        configureResponseMapping(messageMapping,
                                 path: "/api/messages/",
                                 method: .POST)
        
        configureResponseMapping(emptyMapping,
                                 path: "/api/messages/:pk/",
                                 method: .PUT)

        
        // ================= Interviews ================
        
        let interviewRelationships = [ [ "source": "messages",
                                         "destination": "messages",
                                         "mapping": messageMapping ] ]
        
        let interviewMapping = createResponseMappingForClass(Interview.classForCoder(),
                                                             array: Interview.mappingArray,
                                                             dictionary: inverseDictionary(Interview.mappingDictionary),
                                                             relationships: inverseRelationships(interviewRelationships))
        
        configureRequestMapping(InterviewForSave.classForCoder(),
                                requestArray: InterviewForSave.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
        
        configureResponseMapping(interviewMapping,
                                 path: "/api/interviews/",
                                 method: .POST)
        
        configureResponseMapping(interviewMapping,
                                 path: "/api/interviews/:pk/",
                                 method: .any)
        
        configureResponseMapping(interviewMapping,
                                 path: "/api/interviews/:pk/accept/",
                                 method: .POST)
        
        configureResponseMapping(interviewMapping,
                                 path: "/api/interviews/:pk/complete/",
                                 method: .POST)
        
        
        // ================= Application =====================
        
        let applicationRelationships = [ [ "source": "job",
                                           "destination": "job_data",
                                           "mapping": jobMapping ],
                                         [ "source": "jobSeeker",
                                           "destination": "job_seeker",
                                           "mapping": jobSeekerMapping ],
                                         [ "source": "messages",
                                           "destination": "messages",
                                           "mapping": messageMapping ],
                                         [ "source": "pitches",
                                           "destination": "pitches",
                                           "mapping": pitchMapping ],
                                         [ "source": "interviews",
                                           "destination": "interviews",
                                           "mapping": interviewMapping ] ]
        
        let applicationMapping = createResponseMappingForClass(Application.classForCoder(),
                                                               array: Application.mappingArray,
                                                               dictionary: inverseDictionary(Application.mappingDictionary),
                                                               relationships: inverseRelationships(applicationRelationships))
        
        configureRequestMapping(ApplicationForCreation.classForCoder(),
                                requestArray: ApplicationForCreation.mappingArray,
                                requestDictionary: ApplicationForCreation.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        
        configureRequestMapping(ApplicationForCreationWithPitch.classForCoder(),
                                requestArray: ApplicationForCreationWithPitch.mappingArray,
                                requestDictionary: ApplicationForCreationWithPitch.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        
        configureRequestMapping(ExternalApplicationForCreation.classForCoder(),
                                requestArray: ExternalApplicationForCreation.mappingArray,
                                requestDictionary: ExternalApplicationForCreation.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        
        configureRequestMapping(ApplicationStatusUpdate.classForCoder(),
                                requestArray: ApplicationStatusUpdate.mappingArray,
                                requestDictionary: ApplicationStatusUpdate.mappingDictionary,
                                requestRelationships: nil,
                                method: .PUT)
        
        configureRequestMapping(ApplicationShortlistUpdate.classForCoder(),
                                requestArray: ApplicationShortlistUpdate.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .PUT)
        
        configureResponseMapping(applicationMapping,
                                 path: "/api/applications/",
                                 method: .POST)
        
        configureResponseMapping(applicationMapping,
                                 path: "/api/applications/external/",
                                 method: .POST)
        
        configureResponseMapping(applicationMapping,
                                 path: "/api/applications/",
                                 method: .GET)

         configureResponseMapping(applicationMapping,
                                 path: "/api/applications/:pk/",
                                 method: [.GET, .PUT, .DELETE])
        
        
        //================== BusinessUser ================
        
        let businessUserMapping = createResponseMappingForClass(BusinessUser.classForCoder(),
                                                                array: BusinessUser.mappingArray,
                                                                dictionary: nil,
                                                                relationships: nil)
        
        configureRequestMapping(BusinessUserForCreation.classForCoder(),
                                requestArray: BusinessUserForCreation.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .POST)
            
        configureRequestMapping(BusinessUserForUpdate.classForCoder(),
                                requestArray: BusinessUserForUpdate.mappingArray,
                                requestDictionary: nil,
                                requestRelationships: nil,
                                method: .PUT)
            
        configureResponseMapping(businessUserMapping,
                                 path: "/api/user-businesses/:pk/users/",
                                 method: [.GET, .POST])
        
        configureResponseMapping(businessUserMapping,
                                 path: "/api/user-businesses/:pk/users/:pk/",
                                 method: [.GET, .PUT, .DELETE])
        
        configureResponseMapping(businessUserMapping,
                                 path: "/api/user-businesses/:pk/users/:pk/resend-invitation/",
                                 method: .POST)
        
        
        // ================= Error =====================

        let errorMapping = RKObjectMapping(for: RKErrorMessage.classForCoder())
        let attributeMapping = RKAttributeMapping(fromKeyPath: nil, toKeyPath: "userInfo")
        errorMapping?.addPropertyMapping(attributeMapping)

        let errorResponseDescriptor = RKResponseDescriptor(mapping: errorMapping,
                                                           method: .any,
                                                           pathPattern: nil,
                                                           keyPath: nil,
                                                           statusCodes: RKStatusCodeIndexSetForClass(.clientError))
        manager.addResponseDescriptor(errorResponseDescriptor)

    }


    private func inverseDictionary(_ dictionary: [String: String]!) -> [String: String]! {

        if dictionary == nil {
            return nil
        }
        
        var result: [String: String] = [:]
        for (key, value) in dictionary {
            result[value] = key
        }
        return result
    }

    private func inverseRelationships(_ relationships: [[String: Any]]!) -> [[String: Any]]! {

        if relationships == nil {
            return nil
        }

        return relationships.map { [
            "source": $0["destination"] as! String,
            "destination": $0["source"] as! String,
            "mapping": $0["mapping"] as! RKMapping,
            ] }
    }

    private func setupMapping(_ mapping: RKObjectMapping,
                              array: [String]!,
                              dictionary: [String: String]!,
                              relationships: [[String: Any]]!) {

        if array != nil {
            mapping.addAttributeMappings(from: array)
        }

        if dictionary != nil {
            mapping.addAttributeMappings(from: dictionary)
        }

        if relationships != nil {
            for relationship in relationships {
                let propertyMapping = RKRelationshipMapping(fromKeyPath: relationship["source"] as! String,
                                                            toKeyPath: relationship["destination"] as! String,
                                                            with: relationship["mapping"] as! RKMapping)
                mapping.addPropertyMapping(propertyMapping)
            }
        }
    }

    private func createResponseMappingForClass(_ responseClass: Swift.AnyClass,
                                               array: [String]!,
                                               dictionary: [String: String]!,
                                               relationships: [[String: Any]]!) -> RKObjectMapping {

        let responseMapping = RKObjectMapping(for: responseClass)!
        setupMapping(responseMapping,
                     array: array,
                     dictionary: dictionary,
                     relationships: relationships)

        return responseMapping
    }

    private func configureRequestMapping(_ requestClass: Swift.AnyClass,
                                         requestArray: [String]!,
                                         requestDictionary: [String: String]!,
                                         requestRelationships: [[String: Any]]!,
                                         method: RKRequestMethod) {

        let requestMapping = RKObjectMapping.request()!
        setupMapping(requestMapping,
                     array: requestArray,
                     dictionary: requestDictionary,
                     relationships: requestRelationships)
        
        let requestDescriptor = RKRequestDescriptor(mapping: requestMapping,
                                                    objectClass: requestClass,
                                                    rootKeyPath: nil,
                                                    method: method)
        manager.addRequestDescriptor(requestDescriptor)
    }

    private func configureResponseMapping(_ responseClass: Swift.AnyClass,
                                          responseArray: [String]!,
                                          responseDictionary: [String: String]!,
                                          responseRelationships: [[String: Any]]!,
                                          path: String,
                                          method: RKRequestMethod) {

        let responseMapping = createResponseMappingForClass(responseClass,
                                                            array: responseArray,
                                                            dictionary: responseDictionary,
                                                            relationships: responseRelationships)
        
        configureResponseMapping(responseMapping, path: path, method: method)
    }
    
    private func configureResponseMapping(_ mapping: RKObjectMapping,
                                          path: String,
                                          method: RKRequestMethod) {
        
        let responseDescriptor = RKResponseDescriptor(mapping: mapping,
                                                      method: method,
                                                      pathPattern: path,
                                                      keyPath: nil,
                                                      statusCodes: RKStatusCodeIndexSetForClass(RKStatusCodeClass.successful))
        
        manager.addResponseDescriptor(responseDescriptor)
    }
    
    private func configureMapping(_ requestClass: Swift.AnyClass,
                                  requestArray: [String]!,
                                  requestDictionary: [String: String]!,
                                  requestRelationships: [[String: Any]]!,
                                  responseClass: Swift.AnyClass,
                                  responseArray: [String]!,
                                  responseDictionary: [String: String]!,
                                  responseRelationships: [[String: Any]]!,
                                  path: String,
                                  method: RKRequestMethod) {

        configureRequestMapping(requestClass,
                                requestArray: requestArray,
                                requestDictionary: requestDictionary,
                                requestRelationships: requestRelationships,
                                method: method)

        configureResponseMapping(responseClass,
                                 responseArray: responseArray,
                                 responseDictionary: responseDictionary,
                                 responseRelationships: responseRelationships,
                                 path: path,
                                 method: method)
    }

    private func configureSimpleMapping(_ mappingClass: Swift.AnyClass,
                                        mappingArray: [String]!,
                                        mappingDictionary: [String: String]!,
                                        mappingRelationships: [[String: Any]]!,
                                        path: String!,
                                        method: RKRequestMethod) {

        configureRequestMapping(mappingClass,
                                requestArray: mappingArray,
                                requestDictionary: mappingDictionary,
                                requestRelationships: mappingRelationships,
                                method: method)

        configureResponseMapping(mappingClass,
                                 responseArray: mappingArray,
                                 responseDictionary: inverseDictionary(mappingDictionary),
                                 responseRelationships: inverseRelationships(mappingRelationships),
                                 path: path,
                                 method: method)
    }

}
