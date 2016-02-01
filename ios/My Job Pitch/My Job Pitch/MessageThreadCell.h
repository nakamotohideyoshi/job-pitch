//
//  MessageThreadCell.h
//  My Job Pitch
//
//  Created by user on 01/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MessageThreadCell : UITableViewCell
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *rightContraint;
@property (weak, nonatomic) IBOutlet UILabel *message;
@property (weak, nonatomic) IBOutlet UILabel *byLine;
@end
