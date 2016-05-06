//
//  MessageListCell.h
//  Pods
//
//  Created by user on 31/01/2016.
//
//

#import <UIKit/UIKit.h>

@interface MessageListCell : UITableViewCell

@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *from;
@property (weak, nonatomic) IBOutlet UILabel *attributes;
@property (weak, nonatomic) IBOutlet UILabel *message;

@end
