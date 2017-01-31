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

        let client = AFRKHTTPClient(baseURL: AppData.apiRoot)

        manager = RKObjectManager.init(httpClient: client)!
        manager.requestSerializationMIMEType = RKMIMETypeJSON


        // ================= authorization =====================

        configureMapping(LoginRequest.classForCoder(),
                         requestArray: [ "email", "password" ],
                         requestDictionary: nil,
                         requestRelationships: nil,
                         responseClass: AuthToken.classForCoder(),
                         responseArray: [ "key" ],
                         responseDictionary: nil,
                         responseRelationships: nil,
                         path: "/api-rest-auth/login/",
                         method: .POST)

        configureMapping(RegisterRequest.classForCoder(),
                         requestArray: [ "email", "password1", "password2" ],
                         requestDictionary: nil,
                         requestRelationships: nil,
                         responseClass: AuthToken.classForCoder(),
                         responseArray: [ "key" ],
                         responseDictionary: nil,
                         responseRelationships: nil,
                         path: "/api-rest-auth/registration/",
                         method: .POST)

        configureSimpleMapping(PasswordResetRequest.classForCoder(),
                               mappingArray: [ "email" ],
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api-rest-auth/password/reset/",
                               method: .POST)

        configureSimpleMapping(PasswordChangeRequest.classForCoder(),
                               mappingArray: nil,
                               mappingDictionary: [ "password1": "new_password1",
                                                    "password2": "new_password2"],
                               mappingRelationships: nil,
                               path: "/api-rest-auth/password/change/",
                               method: .POST)

        configureResponseMapping(User.classForCoder(),
                                 responseArray: [ "id", "email", "businesses" ],
                                 responseDictionary: [ "job_seeker":            "jobSeeker",
                                                       "can_create_businesses": "canCreateBusinesses" ],
                                 responseRelationships: nil,
                                 path: "/api-rest-auth/user/",
                                 method: .GET)


        // ================= data =====================

        let nameArray = [ "id", "name" ]

        let nameDescDictionary = [ "desc": "description" ]

        let shortNameDictionary = [ "shortName": "short_name" ]

        let shortNameDescDictionary = [ "shortName":    "short_name",
                                        "desc":         "description" ]

        let friendlyNameDescDictionary = [ "shortName": "short_name",
                                           "desc":      "description" ]

        configureResponseMapping(Hours.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(shortNameDescDictionary),
                                 responseRelationships: nil,
                                 path: "/api/hours/",
                                 method: .GET)

        configureResponseMapping(Contract.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(shortNameDescDictionary),
                                 responseRelationships: nil,
                                 path: "/api/contracts/",
                                 method: .GET)

        configureResponseMapping(Sector.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(nameDescDictionary),
                                 responseRelationships: nil,
                                 path: "/api/sectors/",
                                 method: .GET)

        configureResponseMapping(Sex.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(shortNameDescDictionary),
                                 responseRelationships: nil,
                                 path: "/api/sexes/",
                                 method: .GET)

        configureResponseMapping(Nationality.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(shortNameDictionary),
                                 responseRelationships: nil,
                                 path: "/api/nationalities/",
                                 method: .GET)

        configureResponseMapping(JobStatus.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(friendlyNameDescDictionary),
                                 responseRelationships: nil,
                                 path: "/api/job-statuses/",
                                 method: .GET)

        configureResponseMapping(ApplicationStatus.classForCoder(),
                                 responseArray: nameArray,
                                 responseDictionary: inverseDictionary(friendlyNameDescDictionary),
                                 responseRelationships: nil,
                                 path: "/api/application-statuses/",
                                 method: .GET)

        configureResponseMapping(Role.classForCoder(),
                                 responseArray: nameArray,
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

        let pitchArray = [ "id", "video", "thumbnail", "job_seeker", "token" ]

        let pitchMapping = createResponseMappingForClass(Pitch.classForCoder(),
                                                         array: pitchArray,
                                                         dictionary: nil,
                                                         relationships: nil)

        configureSimpleMapping(Pitch.classForCoder(),
                               mappingArray: pitchArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/pitches/",
                               method: .POST)

        configureSimpleMapping(Pitch.classForCoder(),
                               mappingArray: pitchArray,
                               mappingDictionary: nil,
                               mappingRelationships: nil,
                               path: "/api/pitches/:pk/",
                               method: .GET)

        // ================= Profile =====================

        let profileArray = [ "id", "created", "updated", "latitude",
                             "longitude", "contract", "hours", "sectors" ]

        let profileDictionary = [ "searchRadius": "search_radius",
                                  "placeID": "place_id",
                                  "placeName": "place_name",
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


        // ================= Job Seeker =====================

        let jobSeekerArray = [ "id", "email", "created", "updated", "telephone", "mobile",
                               "age", "sex", "nationality", "profile", "cv", "active" ]

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
                                    "truthConfirmation":    "truth_confirmation" ]

        let jobSeekerRelationships = [ [ "source":          "pitches",
                                         "destination":     "pitches",
                                         "mapping":         pitchMapping ] ]

        let jobSeekerMapping = createResponseMappingForClass(JobSeeker.classForCoder(),
                                                             array: jobSeekerArray,
                                                             dictionary: inverseDictionary(jobSeekerDictionary),
                                                             relationships: inverseRelationships(jobSeekerRelationships))

        configureMapping(JobSeeker.classForCoder(),
                         requestArray: jobSeekerArray,
                         requestDictionary: jobSeekerDictionary,
                         requestRelationships: nil,
                         responseClass: JobSeeker.classForCoder(),
                         responseArray: jobSeekerArray,
                         responseDictionary: inverseDictionary(jobSeekerDictionary),
                         responseRelationships: inverseRelationships(jobSeekerRelationships),
                         path: "/api/job-seekers/",
                         method: .any)

        configureMapping(JobSeeker.classForCoder(),
                         requestArray: jobSeekerArray,
                         requestDictionary: jobSeekerDictionary,
                         requestRelationships: nil,
                         responseClass: JobSeeker.classForCoder(),
                         responseArray: jobSeekerArray,
                         responseDictionary: inverseDictionary(jobSeekerDictionary),
                         responseRelationships: inverseRelationships(jobSeekerRelationships),
                         path: "/api/job-seekers/:pk/",
                         method: .any)


        // ================= Business =====================

        let businessArray = [ "id", "created", "updated", "users",
                              "locations", "name", "tokens" ]

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

        let jobDictionary = [ "desc": "description" ]

        let jobRelationships = [ [ "source": "locationData",
                                   "destination": "location_data",
                                   "mapping": locationMapping ],
                                 [ "source": "images",
                                   "destination": "images",
                                   "mapping": imageMapping ] ]

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

        let messageArray = [ "id", "system", "content", "read", "created", "application" ]

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


        // ================= Application =====================

        let applictionCreateArray = [ "id", "job", "shortlisted" ]

        let applictionCreateDictionary = [ "jobSeeker": "job_seeker" ]

        configureSimpleMapping(ApplicationForCreation.classForCoder(),
                               mappingArray: applictionCreateArray,
                               mappingDictionary: applictionCreateDictionary,
                               mappingRelationships: nil,
                               path: "/api/applications/",
                               method: .POST)

        let applicationArray = [ "id", "created", "updated", "shortlisted", "status" ]

        let applicationDictionary = [ "createdBy": "created_by",
                                      "deletedBy": "deleted_by" ]

        let applicationRelationships = [ [ "source": "job",
                                           "destination": "job_data",
                                           "mapping": jobMapping ],
                                         [ "source": "jobSeeker",
                                           "destination": "job_seeker",
                                           "mapping": jobSeekerMapping ],
                                         [ "source": "messages",
                                           "destination": "messages",
                                           "mapping": messageMapping ] ]

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
                                 method: .GET)

        configureResponseMapping(Application.classForCoder(),
                                 responseArray: applicationArray,
                                 responseDictionary: inverseDictionary(applicationDictionary),
                                 responseRelationships: inverseRelationships(applicationRelationships),
                                 path: "/api/applications/:pk/",
                                 method: .DELETE)


        let applicationStatusUpdateArray = [ "id", "status" ]

        configureSimpleMapping(ApplicationStatusUpdate.classForCoder(),
                               mappingArray: applicationStatusUpdateArray,
                               mappingDictionary: nil,
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

        let responseDescriptor = RKResponseDescriptor(mapping: responseMapping,
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