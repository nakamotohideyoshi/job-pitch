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

        configureSimpleMapping(PasswordResetRequest.classForCoder(),
                               mappingArray: PasswordResetRequest.mappingArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api-rest-auth/password/reset/",
                               method: .POST)

        configureSimpleMapping(PasswordChangeRequest.classForCoder(),
                               mappingArray: nil,
                               mappingDictionary: PasswordChangeRequest.mappingDictionary,
                               mappingRelationships: nil,
                               path: "/api-rest-auth/password/change/",
                               method: .POST)

        configureResponseMapping(User.classForCoder(),
                                 responseArray: User.mappingArray,
                                 responseDictionary: inverseDictionary(User.mappingDictionary),
                                 responseRelationships: nil,
                                 path: "/api-rest-auth/user/",
                                 method: .GET)


        // ================= data =====================

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

        let imageArray = [ "id", "image", "thumbnail" ]

        let imageMapping = createResponseMappingForClass(Image.classForCoder(),
                                                         array: imageArray,
                                                         dictionary: nil,
                                                         relationships: nil)

        configureResponseMapping(Image.classForCoder(),
                                 responseArray: imageArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-business-images/",
                                 method: .POST)

        configureResponseMapping(Image.classForCoder(),
                                 responseArray: imageArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-location-images/",
                                 method: .POST)

        configureResponseMapping(Image.classForCoder(),
                                 responseArray: imageArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-job-images/",
                                 method: .POST)

        configureResponseMapping(NSObject.classForCoder(),
                                 responseArray: nil,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-business-images/:pk/",
                                 method: .DELETE)

        configureResponseMapping(NSObject.classForCoder(),
                                 responseArray: nil,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-location-images/:pk/",
                                 method: .DELETE)

        configureResponseMapping(NSObject.classForCoder(),
                                 responseArray: nil,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-job-images/:pk/",
                                 method: .DELETE)


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

        let profileArray = [ "id", "created", "updated", "latitude",
                             "longitude", "contract", "hours", "sectors" ]

        let profileDictionary = [ "searchRadius": "search_radius",
                                  "placeID": "place_id",
                                  "placeName": "place_name",
                                  "postcodeLookup": "postcode_lookup",
                                  "jobSeeker": "job_seeker" ]

        configureSimpleMapping(Profile.classForCoder(),
                               mappingArray: profileArray,
                               mappingDictionary: profileDictionary,
                               mappingRelationships: nil,
                               path: "/api/job-profiles/",
                               method: .any)

        configureSimpleMapping(Profile.classForCoder(),
                               mappingArray: profileArray,
                               mappingDictionary: profileDictionary,
                               mappingRelationships: nil,
                               path: "/api/job-profiles/:pk/",
                               method: .any)


        // ================= Jobseeker =====================
        
        let jobSeekerForSaveArray = [ "active", "email", "telephone", "mobile", "age", "sex", "nationality", "national_insurance_number" ]
        
        let jobSeekerForSaveDictionary = [ "firstName":            "first_name",
                                           "lastName":             "last_name",
                                           "desc":                 "description",
                                           "emailPublic":          "email_public",
                                           "telephonePublic":      "telephone_public",
                                           "mobilePublic":         "mobile_public",
                                           "agePublic":            "age_public",
                                           "sexPublic":            "sex_public",
                                           "nationalityPublic":    "nationality_public",
                                           "hasReferences":        "has_references",
                                           "truthConfirmation":    "truth_confirmation" ]
        
        let jobSeekerArray = [ "id", "email", "created", "updated", "telephone", "mobile",
                               "age", "sex", "nationality", "national_insurance_number", "has_national_insurance_number", "profile", "cv", "active" ]

        let jobSeekerDictionary = [ "firstName":            "first_name",
                                    "lastName":             "last_name",
                                    "desc":                 "description",
                                    "emailPublic":          "email_public",
                                    "telephonePublic":      "telephone_public",
                                    "mobilePublic":         "mobile_public",
                                    "agePublic":            "age_public",
                                    "sexPublic":            "sex_public",
                                    "nationalityPublic":    "nationality_public",
                                    "hasReferences":        "has_references",
                                    "truthConfirmation":    "truth_confirmation",
                                    "profileImage":         "profile_image",
                                    "profileThumb":         "profile_thumb" ]

        let jobSeekerRelationships = [ [ "source":          "pitches",
                                         "destination":     "pitches",
                                         "mapping":         pitchMapping ] ]

        configureMapping(JobSeeker.classForCoder(),
                         requestArray: jobSeekerForSaveArray,
                         requestDictionary: jobSeekerForSaveDictionary,
                         requestRelationships: nil,
                         responseClass: JobSeeker.classForCoder(),
                         responseArray: jobSeekerArray,
                         responseDictionary: inverseDictionary(jobSeekerDictionary),
                         responseRelationships: inverseRelationships(jobSeekerRelationships),
                         path: "/api/job-seekers/",
                         method: [.GET, .POST])

        configureMapping(JobSeeker.classForCoder(),
                         requestArray: jobSeekerForSaveArray,
                         requestDictionary: jobSeekerForSaveDictionary,
                         requestRelationships: nil,
                         responseClass: JobSeeker.classForCoder(),
                         responseArray: jobSeekerArray,
                         responseDictionary: inverseDictionary(jobSeekerDictionary),
                         responseRelationships: inverseRelationships(jobSeekerRelationships),
                         path: "/api/job-seekers/:pk/",
                         method: [.GET, .PATCH])

        // ================= Business =====================

        let businessArray = [ "id", "created", "updated", "users",
                              "locations", "name", "tokens", "restricted" ]

        let businessRelationships = [ [ "source":       "images",
                                        "destination":  "images",
                                        "mapping":      imageMapping ] ]

        let businessMapping = createResponseMappingForClass(Business.classForCoder(),
                                                            array: businessArray,
                                                            dictionary: nil,
                                                            relationships: inverseRelationships(businessRelationships))

        configureMapping(Business.classForCoder(),
                         requestArray: businessArray,
                         requestDictionary: nil,
                         requestRelationships: nil,
                         responseClass: Business.classForCoder(),
                         responseArray: businessArray,
                         responseDictionary: nil,
                         responseRelationships: inverseRelationships(businessRelationships),
                         path: "/api/user-businesses/",
                         method: .any)

        configureMapping(Business.classForCoder(),
                         requestArray: businessArray,
                         requestDictionary: nil,
                         requestRelationships: nil,
                         responseClass: Business.classForCoder(),
                         responseArray: businessArray,
                         responseDictionary: nil,
                         responseRelationships: inverseRelationships(businessRelationships),
                         path: "/api/user-businesses/:pk/",
                         method: .any)

        
        // ================= Location =====================

        let locationArray = [ "id", "created", "updated", "business", "jobs", "name",
                              "email", "telephone", "mobile", "longitude", "latitude", "address" ]

        let locationDictionary = [ "desc": "description",
                                   "emailPublic": "email_public",
                                   "mobilePublic": "mobile_public",
                                   "telephonePublic": "telephone_public",
                                   "placeName": "place_name",
                                   "placeID": "place_id" ]

        let locationRelationships = [ [ "source": "businessData",
                                        "destination": "business_data",
                                        "mapping": businessMapping ],
                                      [ "source": "images",
                                        "destination": "images",
                                        "mapping": imageMapping ] ]

        let locationMapping = createResponseMappingForClass(Location.classForCoder(),
                                                            array: locationArray,
                                                            dictionary: inverseDictionary(locationDictionary),
                                                            relationships: inverseRelationships(locationRelationships))

        configureMapping(Location.classForCoder(),
                         requestArray: locationArray,
                         requestDictionary: locationDictionary,
                         requestRelationships: nil,
                         responseClass: Location.classForCoder(),
                         responseArray: locationArray,
                         responseDictionary: inverseDictionary(locationDictionary),
                         responseRelationships: inverseRelationships(locationRelationships),
                         path: "/api/user-locations/",
                         method: .any)

        configureMapping(Location.classForCoder(),
                         requestArray: locationArray,
                         requestDictionary: locationDictionary,
                         requestRelationships: nil,
                         responseClass: Location.classForCoder(),
                         responseArray: locationArray,
                         responseDictionary: inverseDictionary(locationDictionary),
                         responseRelationships: inverseRelationships(locationRelationships),
                         path: "/api/user-locations/:pk/",
                         method: .any)


        // ================= Job =====================

        let jobArray = [ "id", "created", "updated", "title", "sector",
                         "location", "contract", "hours", "status" ]

        let jobDictionary = [ "desc":           "description",
                              "requiresPitch":  "requires_pitch",
                              "requiresCV":     "requires_cv" ]

        let jobRelationships = [ [ "source": "locationData",
                                   "destination": "location_data",
                                   "mapping": locationMapping ],
                                 [ "source": "images",
                                   "destination": "images",
                                   "mapping": imageMapping ],
                                 [ "source":          "videos",
                                   "destination":     "videos",
                                   "mapping":         pitchMapping ] ]
        
        let jobMapping = createResponseMappingForClass(Job.classForCoder(),
                                                       array: jobArray,
                                                       dictionary: inverseDictionary(jobDictionary),
                                                       relationships: inverseRelationships(jobRelationships))

        configureResponseMapping(Job.classForCoder(),
                                 responseArray: jobArray,
                                 responseDictionary: inverseDictionary(jobDictionary),
                                 responseRelationships: inverseRelationships(jobRelationships),
                                 path: "/api/jobs/",
                                 method: .GET)
        
        configureResponseMapping(Job.classForCoder(),
                                 responseArray: jobArray,
                                 responseDictionary: inverseDictionary(jobDictionary),
                                 responseRelationships: inverseRelationships(jobRelationships),
                                 path: "/api/jobs/:pk/",
                                 method: .GET)

        configureMapping(Job.classForCoder(),
                         requestArray: jobArray,
                         requestDictionary: jobDictionary,
                         requestRelationships: nil,
                         responseClass: Job.classForCoder(),
                         responseArray: jobArray,
                         responseDictionary: inverseDictionary(jobDictionary),
                         responseRelationships: inverseRelationships(jobRelationships),
                         path: "/api/user-jobs/",
                         method: .any)

        configureMapping(Job.classForCoder(),
                         requestArray: jobArray,
                         requestDictionary: jobDictionary,
                         requestRelationships: nil,
                         responseClass: Job.classForCoder(),
                         responseArray: jobArray,
                         responseDictionary: inverseDictionary(jobDictionary),
                         responseRelationships: inverseRelationships(jobRelationships),
                         path: "/api/user-jobs/:pk/",
                         method: .any)
        
        // ================= Message =====================

        let messageArray = [ "id", "system", "content", "read", "created", "application", "interview" ]

        let messageDictionary = [ "fromRole": "from_role" ]

        let messageMapping = createResponseMappingForClass(Message.classForCoder(),
                                                           array: messageArray,
                                                           dictionary: inverseDictionary(messageDictionary),
                                                           relationships: nil)


        let createMessageArray = [ "id", "application", "content" ]

        configureSimpleMapping(MessageForCreation.classForCoder(),
                               mappingArray: createMessageArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/messages/",
                               method: .POST)
        
        configureSimpleMapping(MessageForUpdate.classForCoder(),
                               mappingArray: ["read"],
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/messages/:pk/",
                               method: .PUT)

        // ================= Interviews ================
        
        let interviewMapping = createResponseMappingForClass(Interview.classForCoder(),
                                                             array: [ "id", "at", "notes", "feedback", "cancelled", "status" ],
                                                             dictionary: inverseDictionary([ "cancelledBy": "cancelled_by" ]),
                                                             relationships: inverseRelationships([ [ "source": "messages",
                                                                                                     "destination": "messages",
                                                                                                     "mapping": messageMapping ] ]))
        
        let interviewForSaveArray = [ "invitation", "application", "at", "notes", "feedback" ]
        
        configureSimpleMapping(InterviewForSave.classForCoder(),
                               mappingArray: interviewForSaveArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/interviews/",
                               method: .POST)
        
        configureSimpleMapping(InterviewForSave.classForCoder(),
                               mappingArray: interviewForSaveArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/interviews/:pk/",
                               method: .PUT)
        
        configureSimpleMapping(InterviewForSave.classForCoder(),
                               mappingArray: nil,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/interviews/:pk/",
                               method: .DELETE)
        
        configureSimpleMapping(InterviewForSave.classForCoder(),
                               mappingArray: interviewForSaveArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/interviews/:pk/accept/",
                               method: .POST)
        
        configureSimpleMapping(InterviewForSave.classForCoder(),
                               mappingArray: interviewForSaveArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/interviews/:pk/complete/",
                               method: .POST)
        
        // ================= Application =====================
        
        configureMapping(ApplicationForCreation.classForCoder(),
                         requestArray: ApplicationForCreation.mappingArray,
                         requestDictionary: ApplicationForCreation.mappingDictionary,
                         requestRelationships: nil,
                         responseClass: ApplicationForCreation.classForCoder(),
                         responseArray: ApplicationForCreation.mappingArray,
                         responseDictionary: inverseDictionary(ApplicationForCreation.mappingDictionary),
                         responseRelationships: nil,
                         path: "/api/applications/",
                         method: .POST)
        
        configureRequestMapping(ApplicationForCreationWithPitch.classForCoder(),
                                requestArray: ApplicationForCreationWithPitch.mappingArray,
                                requestDictionary: ApplicationForCreationWithPitch.mappingDictionary,
                                requestRelationships: nil,
                                method: .POST)
        
        configureMapping(ExternalApplicationForCreation.classForCoder(),
                         requestArray: ExternalApplicationForCreation.mappingArray,
                         requestDictionary: ExternalApplicationForCreation.mappingDictionary,
                         requestRelationships: nil,
                         responseClass: ApplicationForCreation.classForCoder(),
                         responseArray: ApplicationForCreation.mappingArray,
                         responseDictionary: inverseDictionary(ApplicationForCreation.mappingDictionary),
                         responseRelationships: nil,
                         path: "/api/applications/external/",
                         method: .POST)
        
        let applicationArray = [ "id", "created", "updated", "shortlisted", "status" ]

        let applicationDictionary = [ "createdBy": "created_by",
                                      "deletedBy": "deleted_by" ]

        let jobSeekerMapping = createResponseMappingForClass(JobSeeker.classForCoder(),
                                                             array: jobSeekerArray,
                                                             dictionary: inverseDictionary(jobSeekerDictionary),
                                                             relationships: inverseRelationships(jobSeekerRelationships))
        
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

        configureResponseMapping(Application.classForCoder(),
                                 responseArray: applicationArray,
                                 responseDictionary: inverseDictionary(applicationDictionary),
                                 responseRelationships: inverseRelationships(applicationRelationships),
                                 path: "/api/applications/",
                                 method: .GET)

        configureResponseMapping(Application.classForCoder(),
                                 responseArray: applicationArray,
                                 responseDictionary: inverseDictionary(applicationDictionary),
                                 responseRelationships: inverseRelationships(applicationRelationships),
                                 path: "/api/applications/:pk/",
                                 method: [.GET, .DELETE])

        let applicationStatusUpdateArray = [ "id"]

        configureSimpleMapping(ApplicationStatusUpdate.classForCoder(),
                               mappingArray: applicationStatusUpdateArray,
                               mappingDictionary: ["status": "connect"],
                               mappingRelationships: nil,
                               path: "/api/applications/:pk/",
                               method: .PUT)


        let applicationShortlistUpdateArray = [ "id", "shortlisted" ]

        configureSimpleMapping(ApplicationShortlistUpdate.classForCoder(),
                               mappingArray: applicationShortlistUpdateArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/applications/:pk/",
                               method: .PUT)
        
        
        //================== Deprecation ================
        
        let deprecationArray = [ "platform", "warning", "error" ]
        
        configureResponseMapping(Deprecation.classForCoder(),
                                 responseArray: deprecationArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/deprecation/",
                                 method: .GET)
        
        //================== BusinessUser ================
        
        
        let businessUserArray = [ "id", "user", "email", "locations", "business"]
        
        configureResponseMapping(BusinessUser.classForCoder(),
                                 responseArray: businessUserArray,
                                 responseDictionary: nil,
                                 responseRelationships: nil,
                                 path: "/api/user-businesses/:pk/users/",
                                 method: .GET)
        
        
        let createBusinessUserArray = [ "email", "locations" ]
        
        configureSimpleMapping(BusinessUserForCreation.classForCoder(),
                               mappingArray: createBusinessUserArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/user-businesses/:pk/users/",
                               method: .POST)
        
        configureSimpleMapping(BusinessUserForCreation.classForCoder(),
                               mappingArray: createBusinessUserArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/user-businesses/:pk/users/:pk/resend-invitation/",
                               method: .POST)        
        
         let updateBusinessUserArray = [ "locations" ]
        
        configureSimpleMapping(BusinessUserForUpdate.classForCoder(),
                               mappingArray: updateBusinessUserArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/user-businesses/:pk/users/:pk/",
                               method: .PUT)
        configureSimpleMapping(BusinessUser.classForCoder(),
                               mappingArray: businessUserArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/user-businesses/:pk/users/:pk/",
                               method: [.GET, .DELETE])
        
        // ================= new =====================
        
        configureMapping(ExclusionJobSeeker.classForCoder(),
                         requestArray: nil,
                         requestDictionary: ["jobSeeker": "job_seeker"],
                         requestRelationships: nil,
                         responseClass: ExclusionJobSeeker.classForCoder(),
                         responseArray: ["id"],
                         responseDictionary: ["job_seeker": "jobSeeker"],
                         responseRelationships: nil,
                         path: "/api/user-jobs/:pk/exclude/",
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

        var result: [[String: Any]] = []
        for relationship in relationships {
            result.append([
                "source": relationship["destination"] as! String,
                "destination": relationship["source"] as! String,
                "mapping": relationship["mapping"] as! RKMapping,
                ])
        }
        return result
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
