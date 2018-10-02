//
//  SpecificPitchUploader.swift
//  MyJobPitch
//
//  Created by dev on 8/14/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

class SpecificPitchUploader: PitchUploader {
    
    func uploadVideo(videoUrl: URL!, application: NSNumber, complete:((PitchObject?) -> Void)!, progress:((Float) -> Void)!) {
        
        self.endpoint = "aapplication-pitches"
        self.complete = complete
        self.progress = progress
        
        let pitch = SpecificPitch()
        pitch.job_seeker = AppData.jobSeeker.id
        pitch.application = application
        API.shared().saveSpecificPitch(pitch: pitch, success: { (data) in
            self.pitch = data as! SpecificPitch!
            self.convertVideo(videoUrl)
        }) { (message, errors) in
            self.uploadFailed()
        }
    }
    
    override func getPitch() {
        
        API.shared().getSpecificPitch(id: pitch.id, success: { (data) in
            let pitch = data as! SpecificPitch
            if pitch.video == nil {
                Thread.sleep(forTimeInterval: 2)
                self.getPitch()
            } else {
                DispatchQueue.main.async {
                    self.complete?(pitch)
                }
            }
        }) { (message, errors) in
            self.uploadFailed()
        }
    }
}

