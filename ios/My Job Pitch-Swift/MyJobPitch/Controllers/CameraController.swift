//
//  CameraController.swift
//  MyJobPitch
//
//  Created by dev on 12/14/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import CameraManager

class CameraController: UIViewController {

    enum CaptureStatus {
        case none, ready, capture
    }
    
    @IBOutlet weak var cameraView: UIView!
    @IBOutlet weak var recordButton: UIButton!
    @IBOutlet weak var countLabel: UILabel!
    
    let cameraManager = CameraManager()
    
    var captureStatus = CaptureStatus.none
    
    var timer: Timer! {
        willSet(newTimer) {
            if newTimer != nil {
                RunLoop.current.add(newTimer, forMode: RunLoopMode.commonModes)
            } else {
                timer?.invalidate()
            }
        }
    }
    
    var count: Int = 0 {
        didSet {
            countLabel.text = count != 0 ? String(count) : ""
        }
    }
    
    var complete: ((URL?) -> Void)!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        recordButton.layer.cornerRadius = recordButton.frame.size.width / 2
        recordButton.layer.borderColor = UIColor.white.cgColor
        recordButton.layer.borderWidth = 1
        recordButton.backgroundColor = AppData.greenColor
        
        count = 0
                
        cameraManager.cameraDevice = .front
        cameraManager.cameraOutputQuality = .high
        cameraManager.cameraOutputMode = .videoWithMic
        
        let currentCameraState = cameraManager.currentCameraStatus()
        
        if currentCameraState == .notDetermined {
            cameraManager.askUserForCameraPermission({ (permissionGranted) in
                if permissionGranted {
                    self.addCameraToView()
                }
            })
        } else if (currentCameraState == .ready) {
            addCameraToView()
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        cameraManager.resumeCaptureSession()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        cameraManager.stopCaptureSession()
    }
    
    func addCameraToView() {
        _ = cameraManager.addPreviewLayerToView(cameraView)
        cameraManager.showErrorBlock = { (erTitle, erMessage) in
            PopupController.showGray(erMessage, ok: "OK")
        }
    }
    
    func finishCapture() {
        captureStatus = .none
        timer = nil
        recordButton.setTitle("RECORD", for: .normal)
        recordButton.backgroundColor = AppData.greenColor
        
        cameraManager.stopVideoRecording({ (videoURL, error) -> Void in
            if let errorOccured = error {
                self.cameraManager.showErrorBlock("Error occurred", errorOccured.localizedDescription)
            } else {
                DispatchQueue.main.sync {
                    self.complete?(videoURL)
                    _ = self.dismiss(animated: true, completion: nil)
                }
            }
        })
    }
    
    func countDown() {
        count -= 1
        if count == 0 {
            if captureStatus == .ready {
                captureStatus = .capture
                count = 30
                cameraManager.startRecordingVideo()
                recordButton.setTitle("STOP", for: .normal)
                recordButton.backgroundColor = UIColor.red
            } else {
                finishCapture()
            }
        }
    }
    
    @IBAction func cameraSwitchAction(_ sender: Any) {
        cameraManager.cameraDevice = cameraManager.cameraDevice == .back ? .front : .back
    }
    
    @IBAction func closeAction(_ sender: Any) {
        timer = nil
        _ = dismiss(animated: true, completion: nil)
    }
    
    @IBAction func recordAction(_ sender: Any) {

        switch captureStatus {
        case .none:
            captureStatus = .ready
            count = 10
            timer = Timer(timeInterval: 1, target: self, selector: #selector(countDown), userInfo: nil, repeats: true)
            recordButton.setTitle("READY", for: .normal)
            recordButton.backgroundColor = AppData.yellowColor
            
        case .ready:
            captureStatus = .none
            count = 0
            timer = nil
            recordButton.setTitle("RECORD", for: .normal)
            recordButton.backgroundColor = AppData.greenColor
            
        case .capture:
            finishCapture()
        }
    }
    
}
